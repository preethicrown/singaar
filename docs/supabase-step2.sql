-- SINGAAR step 2: AI look requests and artist quotes. Paste ALL of this into Supabase SQL Editor -> Run.
-- Safe to run more than once. Needs docs/supabase-setup.sql to have been run first.

-- A customer's AI Look Brief, sent to verified artists in her city
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  customer uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 1 and 40),
  city text not null check (city in ('Bangalore','Chennai')),
  area text check (char_length(area) <= 60),
  ritual text not null check (char_length(ritual) <= 40),
  date date not null,
  time text check (char_length(time) <= 10),
  budget integer check (budget between 0 and 500000),
  services text[] not null default '{}',
  brief jsonb not null default '{}'::jsonb,
  notes text check (char_length(notes) <= 500),
  status text not null default 'open' check (status in ('open','booked','closed')),
  created_at timestamptz not null default now()
);

-- An artist's price and message for a request
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  price integer not null check (price between 100 and 200000),
  message text check (char_length(message) <= 400),
  status text not null default 'sent' check (status in ('sent','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (request_id, artist_id)
);

-- A booking made by accepting a quote is confirmed straight away
alter table public.bookings add column if not exists quote_id uuid references public.quotes(id) on delete set null;

create or replace function public.my_artist_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from artists where owner = auth.uid() and status = 'approved' limit 1
$$;
create or replace function public.approved_artist_in(c text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from artists where owner = auth.uid() and status = 'approved' and city = c)
$$;
create or replace function public.owns_request(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from requests where id = r and customer = auth.uid())
$$;
create or replace function public.quoted_request(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from quotes q join artists a on a.id = q.artist_id where q.request_id = r and a.owner = auth.uid())
$$;
create or replace function public.request_open_for_me(r uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from requests x where x.id = r and x.status = 'open'
                 and exists (select 1 from artists a where a.owner = auth.uid() and a.status = 'approved' and a.city = x.city))
$$;

alter table public.requests enable row level security;
alter table public.quotes   enable row level security;

-- Requests: the customer sees hers; approved artists in that city see open ones (and ones they quoted)
drop policy if exists requests_read on public.requests;
create policy requests_read on public.requests for select to authenticated
  using (customer = auth.uid() or (status = 'open' and public.approved_artist_in(city)) or public.quoted_request(id) or public.is_admin());
drop policy if exists requests_insert on public.requests;
create policy requests_insert on public.requests for insert to authenticated
  with check (customer = auth.uid() and status = 'open');
drop policy if exists requests_update on public.requests;
create policy requests_update on public.requests for update to authenticated
  using (customer = auth.uid()) with check (customer = auth.uid());

-- Quotes: the artist who sent it and the customer who asked
drop policy if exists quotes_read on public.quotes;
create policy quotes_read on public.quotes for select to authenticated
  using (artist_id = public.my_artist_id() or public.owns_request(request_id) or public.is_admin());
drop policy if exists quotes_insert on public.quotes;
create policy quotes_insert on public.quotes for insert to authenticated
  with check (artist_id = public.my_artist_id() and status = 'sent' and public.request_open_for_me(request_id));
drop policy if exists quotes_update on public.quotes;
create policy quotes_update on public.quotes for update to authenticated
  using (artist_id = public.my_artist_id() or public.owns_request(request_id))
  with check (artist_id = public.my_artist_id() or public.owns_request(request_id));

-- Bookings: a normal request, or a confirmed booking made by accepting that artist's quote at that price
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (customer = auth.uid() and paid = false
    and exists (select 1 from artists a where a.id = artist_id and a.status = 'approved' and a.owner <> auth.uid())
    and (status = 'requested'
         or (status = 'confirmed' and quote_id is not null and exists (
               select 1 from quotes q join requests r on r.id = q.request_id
               where q.id = quote_id and q.artist_id = bookings.artist_id and q.price = bookings.price and r.customer = auth.uid()))));

do $$ begin
  begin alter publication supabase_realtime add table public.requests; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.quotes;   exception when duplicate_object then null; end;
end $$;
