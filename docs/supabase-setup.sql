-- SINGAAR live database (version 2). Paste ALL of this into Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once. Creates: artists (with approval), private artist details, bookings,
-- chat, live trip location, admins, and photo storage, each protected by row-level security.

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  area text not null check (char_length(area) <= 60),
  city text not null check (city in ('Bangalore','Chennai')),
  type text not null default 'artist' check (type in ('artist','studio','salon')),
  travel boolean not null default true,
  services jsonb not null default '{}'::jsonb,
  bio text check (char_length(bio) <= 400),
  handle text check (char_length(handle) <= 40),
  wa text check (wa ~ '^91[6-9][0-9]{9}$'),
  created_at timestamptz not null default now()
);
alter table public.artists add column if not exists status text not null default 'pending';
alter table public.artists add column if not exists photos text[] not null default '{}';
alter table public.artists add column if not exists days text[] not null default '{}';
alter table public.artists add column if not exists blocked date[] not null default '{}';
alter table public.artists add column if not exists review_note text;
alter table public.artists add column if not exists submitted_at timestamptz;
do $$ begin
  alter table public.artists add constraint artists_status_chk check (status in ('draft','pending','approved','rejected'));
exception when duplicate_object then null; end $$;

-- Details only the artist and the SINGAAR team may see
create table if not exists public.artist_private (
  artist_id uuid primary key references public.artists(id) on delete cascade,
  upi text check (upi ~ '^[A-Za-z0-9.\-_]{2,256}@[A-Za-z]{2,64}$'),
  id_doc text,
  id_type text check (id_type in ('PAN','Voter ID','Driving licence','Passport','Masked Aadhaar')),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  customer uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 1 and 40),
  svc text not null check (char_length(svc) <= 30),
  date date not null,
  venue text not null check (char_length(venue) <= 80),
  note text check (char_length(note) <= 240),
  price integer not null check (price between 100 and 200000),
  status text not null default 'requested' check (status in ('requested','confirmed','declined','cancelled','completed')),
  paid boolean not null default false,
  reply text check (char_length(reply) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender uuid not null default auth.uid() references auth.users(id) on delete cascade,
  side text not null check (side in ('customer','artist')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  updated_at timestamptz not null default now()
);

-- ---------- helper checks ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;
create or replace function public.is_customer(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bookings where id = b and customer = auth.uid())
$$;
create or replace function public.is_artist_of(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bookings bk join artists a on a.id = bk.artist_id
                 where bk.id = b and a.owner = auth.uid())
$$;
create or replace function public.owns_artist(a uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from artists where id = a and owner = auth.uid())
$$;

-- Only the SINGAAR team can approve or reject. An artist can submit (draft -> pending) and edit.
create or replace function public.guard_artist_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    if new.status not in ('draft','pending') then new.status := 'draft'; end if;
  else
    if new.status is distinct from old.status and not (new.status = 'pending' and old.status in ('draft','rejected','pending')) then
      new.status := old.status;
    end if;
    new.review_note := old.review_note;
  end if;
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status <> 'pending') then new.submitted_at := now(); end if;
  return new;
end $$;
drop trigger if exists artists_status_guard on public.artists;
create trigger artists_status_guard before insert or update on public.artists
  for each row execute function public.guard_artist_status();

-- ---------- row-level security ----------
alter table public.artists        enable row level security;
alter table public.artist_private enable row level security;
alter table public.admins         enable row level security;
alter table public.bookings       enable row level security;
alter table public.messages       enable row level security;
alter table public.locations      enable row level security;

-- Artists: customers see approved artists; an artist sees her own; the team sees everyone
drop policy if exists artists_read on public.artists;
create policy artists_read on public.artists for select using (status = 'approved' or owner = auth.uid() or public.is_admin());
drop policy if exists artists_insert on public.artists;
create policy artists_insert on public.artists for insert to authenticated with check (owner = auth.uid());
drop policy if exists artists_update on public.artists;
create policy artists_update on public.artists for update to authenticated
  using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());

drop policy if exists private_rw on public.artist_private;
create policy private_rw on public.artist_private for all to authenticated
  using (public.owns_artist(artist_id) or public.is_admin()) with check (public.owns_artist(artist_id) or public.is_admin());

drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

-- Bookings: only that customer and that artist (and the team) see a booking; only approved artists can be booked
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated
  using (customer = auth.uid() or public.is_artist_of(id) or public.is_admin());
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (customer = auth.uid() and status = 'requested' and paid = false
              and exists (select 1 from artists a where a.id = artist_id and a.status = 'approved' and a.owner <> auth.uid()));
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (customer = auth.uid() or public.is_artist_of(id))
  with check (customer = auth.uid() or public.is_artist_of(id));

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select to authenticated
  using (public.is_customer(booking_id) or public.is_artist_of(booking_id));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (sender = auth.uid() and (
    (side = 'customer' and public.is_customer(booking_id)) or
    (side = 'artist' and public.is_artist_of(booking_id))));

drop policy if exists locations_read on public.locations;
create policy locations_read on public.locations for select to authenticated
  using (public.is_customer(booking_id) or public.is_artist_of(booking_id));
drop policy if exists locations_write on public.locations;
create policy locations_write on public.locations for insert to authenticated with check (public.is_artist_of(booking_id));
drop policy if exists locations_update on public.locations;
create policy locations_update on public.locations for update to authenticated
  using (public.is_artist_of(booking_id)) with check (public.is_artist_of(booking_id));

-- ---------- photo storage ----------
-- portfolio: public photos of the artist's own work (5 MB images)
-- ids: private ID documents, visible only to the artist and the SINGAAR team (5 MB image or PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio','portfolio',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ids','ids',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

drop policy if exists portfolio_write on storage.objects;
create policy portfolio_write on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists portfolio_delete on storage.objects;
create policy portfolio_delete on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists ids_write on storage.objects;
create policy ids_write on storage.objects for insert to authenticated
  with check (bucket_id = 'ids' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists ids_read on storage.objects;
create policy ids_read on storage.objects for select to authenticated
  using (bucket_id = 'ids' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- instant updates to phones ----------
do $$ begin
  begin alter publication supabase_realtime add table public.artists;   exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.bookings;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.messages;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.locations; exception when duplicate_object then null; end;
end $$;

-- ---------- make yourself the SINGAAR admin ----------
-- After you sign in once on singaar.vercel.app/admin, run this line with YOUR email:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com' on conflict do nothing;
