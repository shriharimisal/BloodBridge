-- BloodBridge Supabase schema.
-- Apply this file in the Supabase SQL editor before enabling the backend.

-- Keep privileged trigger functions outside the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  blood_group text check (blood_group is null or blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  status text not null default 'Available' check (status in ('Available','Unavailable')),
  last_donation date,
  donation_count integer not null default 0 check (donation_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, phone, city, blood_group, status) on public.profiles to authenticated;
drop policy if exists "profile owner can read" on public.profiles;
create policy "profile owner can read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profile owner can update" on public.profiles;
create policy "profile owner can update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, blood_group)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', nullif(new.email, ''), 'BloodBridge donor'),
    coalesce(new.email, ''),
    case when new.raw_user_meta_data ->> 'blood_group' in ('A+','A-','B+','B-','AB+','AB-','O+','O-') then new.raw_user_meta_data ->> 'blood_group' else null end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_bloodbridge on auth.users;
create trigger on_auth_user_created_bloodbridge
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

create table if not exists public.blood_banks (
  id text primary key,
  name text not null,
  area text not null,
  city text not null,
  distance_km numeric(7,2) not null default 0 check (distance_km >= 0),
  phone text not null default '',
  hours text not null default '',
  address text not null default '',
  stock jsonb not null default '{}'::jsonb,
  is_sample boolean not null default true,
  verified_at timestamptz
);

alter table public.blood_banks enable row level security;
revoke all on public.blood_banks from anon, authenticated;
grant select on public.blood_banks to anon, authenticated;
drop policy if exists "blood bank listings are readable" on public.blood_banks;
create policy "blood bank listings are readable" on public.blood_banks for select to anon, authenticated using (true);

-- These rows are demonstration data only. Replace with verified listings before using real people.
insert into public.blood_banks (id,name,area,city,distance_km,phone,hours,address,stock,is_sample) values
('bb1','City Central Blood Bank','Shivajinagar','Pune',2.4,'020 5550 0101','Open 24 hours','12 Station Road, Shivajinagar','{"A+":14,"A-":3,"B+":9,"B-":0,"AB+":4,"AB-":1,"O+":22,"O-":5}',true),
('bb2','Sahyadri Hospital Blood Centre','Deccan','Pune',4.1,'020 5550 0102','8 am – 10 pm','45 Karve Road, Deccan','{"A+":6,"A-":0,"B+":12,"B-":2,"AB+":0,"AB-":0,"O+":10,"O-":1}',true),
('bb3','Red Cross Blood Bank','Camp','Pune',6.8,'020 5550 0103','9 am – 6 pm','7 MG Road, Camp','{"A+":20,"A-":6,"B+":15,"B-":4,"AB+":8,"AB-":2,"O+":30,"O-":9}',true),
('bb4','Ruby Care Blood Storage','Wakad','Pune',12.5,'020 5550 0104','9 am – 8 pm','3 Datta Mandir Road, Wakad','{"A+":2,"A-":1,"B+":5,"B-":0,"AB+":1,"AB-":0,"O+":7,"O-":0}',true),
('bb5','Mumbai General Blood Centre','Dadar','Mumbai',148,'022 5550 0105','Open 24 hours','22 Tilak Road, Dadar','{"A+":18,"A-":5,"B+":11,"B-":3,"AB+":6,"AB-":2,"O+":25,"O-":7}',true)
on conflict (id) do nothing;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_name text not null,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units integer not null check (units between 1 and 10),
  hospital text not null,
  location text not null,
  required_by timestamptz not null,
  urgency text not null check (urgency in ('Critical','Urgent','Normal')),
  contact_number text not null,
  additional_info text,
  status text not null default 'Open' check (status in ('Open','In progress','Fulfilled')),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;
revoke all on public.requests from anon, authenticated;
grant select (id,blood_group,units,hospital,location,required_by,urgency,status,created_at) on public.requests to anon, authenticated;
grant insert (patient_name,blood_group,units,hospital,location,required_by,urgency,contact_number,additional_info) on public.requests to authenticated;
drop policy if exists "public can read request summaries" on public.requests;
create policy "public can read request summaries" on public.requests for select to anon, authenticated using (status in ('Open','In progress','Fulfilled'));
drop policy if exists "signed-in users can create requests" on public.requests;
create policy "signed-in users can create requests" on public.requests for insert to authenticated with check ((select auth.uid()) = created_by);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;
drop policy if exists "users can read their notifications" on public.notifications;
create policy "users can read their notifications" on public.notifications for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users can mark their notifications read" on public.notifications;
create policy "users can mark their notifications read" on public.notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function private.notify_request_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, text)
  values (new.created_by, 'Request submitted', 'Your ' || new.blood_group || ' request at ' || new.hospital || ' has been submitted.');
  return new;
end;
$$;
revoke all on function private.notify_request_owner() from public, anon, authenticated;

drop trigger if exists on_blood_request_created on public.requests;
create trigger on_blood_request_created
after insert on public.requests
for each row execute function private.notify_request_owner();

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  donated_on date not null,
  blood_bank_name text not null,
  donation_type text not null default 'Whole blood',
  units integer not null default 1 check (units > 0),
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;
revoke all on public.donations from anon, authenticated;
grant select on public.donations to authenticated;
drop policy if exists "users can read their donation history" on public.donations;
create policy "users can read their donation history" on public.donations for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_created_by_idx on public.requests (created_by);
create index if not exists notifications_user_read_created_idx on public.notifications (user_id, read, created_at desc);
create index if not exists donations_user_donated_on_idx on public.donations (user_id, donated_on desc);
