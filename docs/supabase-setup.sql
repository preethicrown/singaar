-- SINGAAR live database. Paste all of this into Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once.

create extension if not exists pgcrypto;

-- Artists and salons who list themselves
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
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

-- Booking requests between a customer and an artist
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

-- Chat messages inside a booking
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender uuid not null default auth.uid() references auth.users(id) on delete cascade,
  side text not null check (side in ('customer','artist')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

-- The artist's live location, only while she is travelling to a booking
create table if not exists public.locations (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  updated_at timestamptz not null default now()
);

-- Who is part of a booking: the customer, or the artist who owns the listing
create or replace function public.is_customer(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bookings where id = b and customer = auth.uid())
$$;
create or replace function public.is_artist_of(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bookings bk join artists a on a.id = bk.artist_id
                 where bk.id = b and a.owner = auth.uid())
$$;

alter table public.artists   enable row level security;
alter table public.bookings  enable row level security;
alter table public.messages  enable row level security;
alter table public.locations enable row level security;

-- Artists: everyone can see listings; only the owner can create or change hers
drop policy if exists artists_read on public.artists;
create policy artists_read on public.artists for select using (true);
drop policy if exists artists_insert on public.artists;
create policy artists_insert on public.artists for insert to authenticated with check (owner = auth.uid());
drop policy if exists artists_update on public.artists;
create policy artists_update on public.artists for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

-- Bookings: only the customer and that artist can see a booking
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated
  using (customer = auth.uid() or public.is_artist_of(id));
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (customer = auth.uid() and status = 'requested' and paid = false);
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (customer = auth.uid() or public.is_artist_of(id))
  with check (customer = auth.uid() or public.is_artist_of(id));

-- Messages: only the two people in the booking
drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select to authenticated
  using (public.is_customer(booking_id) or public.is_artist_of(booking_id));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (sender = auth.uid() and (
    (side = 'customer' and public.is_customer(booking_id)) or
    (side = 'artist' and public.is_artist_of(booking_id))));

-- Location: only the artist writes it, only the two people read it
drop policy if exists locations_read on public.locations;
create policy locations_read on public.locations for select to authenticated
  using (public.is_customer(booking_id) or public.is_artist_of(booking_id));
drop policy if exists locations_write on public.locations;
create policy locations_write on public.locations for insert to authenticated
  with check (public.is_artist_of(booking_id));
drop policy if exists locations_update on public.locations;
create policy locations_update on public.locations for update to authenticated
  using (public.is_artist_of(booking_id)) with check (public.is_artist_of(booking_id));

-- Send changes to phones instantly
do $$ begin
  begin alter publication supabase_realtime add table public.artists;   exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.bookings;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.messages;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.locations; exception when duplicate_object then null; end;
end $$;
