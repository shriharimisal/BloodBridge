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

-- Signed-in donors can add their own completed donation; histories stay private.
alter table public.donations alter column user_id set default auth.uid();
grant insert (donated_on, blood_bank_name, donation_type, units) on public.donations to authenticated;
drop policy if exists "users can record their own donations" on public.donations;
create policy "users can record their own donations"
  on public.donations for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and donated_on <= current_date
    and length(trim(blood_bank_name)) between 1 and 120
    and donation_type in ('Whole blood', 'Platelets', 'Plasma')
    and units between 1 and 10
  );

create or replace function private.sync_donor_profile_after_donation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set donation_count = donation_count + 1,
      last_donation = greatest(last_donation, new.donated_on)
  where id = new.user_id;
  return new;
end;
$$;
revoke all on function private.sync_donor_profile_after_donation() from public, anon, authenticated;
drop trigger if exists sync_donor_profile_after_donation on public.donations;
create trigger sync_donor_profile_after_donation
  after insert on public.donations
  for each row execute function private.sync_donor_profile_after_donation();

create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_created_by_idx on public.requests (created_by);
create index if not exists notifications_user_read_created_idx on public.notifications (user_id, read, created_at desc);
create index if not exists donations_user_donated_on_idx on public.donations (user_id, donated_on desc);

-- Track real blood inventory batches so expired units are never counted as available.
-- Existing JSON stock remains as untracked legacy data until real expiry dates are supplied.
create table if not exists public.blood_inventory_batches (
  id uuid primary key default gen_random_uuid(),
  blood_bank_id text not null references public.blood_banks(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units_remaining integer not null default 0 check (units_remaining >= 0),
  expires_on date not null,
  updated_at timestamptz not null default now()
);

alter table public.blood_inventory_batches enable row level security;
revoke all on public.blood_inventory_batches from anon, authenticated;
grant select (blood_bank_id, blood_group, units_remaining, expires_on) on public.blood_inventory_batches to anon, authenticated;
drop policy if exists "public can read inventory batch summaries" on public.blood_inventory_batches;
create policy "public can read inventory batch summaries"
  on public.blood_inventory_batches for select to anon, authenticated using (true);
create index if not exists blood_inventory_batches_bank_group_expiry_idx
  on public.blood_inventory_batches (blood_bank_id, blood_group, expires_on);

-- Publish only aggregate donation counts. Donor identities and individual records stay private.
create table if not exists public.donation_dashboard_stats (
  id boolean primary key default true check (id is true),
  total_donations bigint not null default 0 check (total_donations >= 0),
  total_units bigint not null default 0 check (total_units >= 0),
  monthly_counts jsonb not null default '[]'::jsonb,
  refreshed_at timestamptz not null default now()
);

alter table public.donation_dashboard_stats enable row level security;
revoke all on public.donation_dashboard_stats from anon, authenticated;
grant select on public.donation_dashboard_stats to anon, authenticated;
drop policy if exists "public can read aggregate donation stats" on public.donation_dashboard_stats;
create policy "public can read aggregate donation stats"
  on public.donation_dashboard_stats for select to anon, authenticated using (true);

create or replace function private.rebuild_donation_dashboard_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  monthly jsonb;
begin
  with months as (
    select (pg_catalog.date_trunc('month', current_date)::date + pg_catalog.make_interval(months => series.month_offset - 5))::date as month_start
    from pg_catalog.generate_series(0, 5) as series(month_offset)
  ), totals as (
    select pg_catalog.date_trunc('month', donated_on)::date as month_start,
      count(*)::bigint as donation_count,
      coalesce(sum(units), 0)::bigint as unit_count
    from public.donations
    where donated_on >= (pg_catalog.date_trunc('month', current_date)::date - interval '5 months')
    group by 1
  )
  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'month', pg_catalog.to_char(months.month_start, 'YYYY-MM'),
        'donations', coalesce(totals.donation_count, 0),
        'units', coalesce(totals.unit_count, 0)
      ) order by months.month_start
    ),
    '[]'::jsonb
  ) into monthly
  from months left join totals using (month_start);

  insert into public.donation_dashboard_stats (id, total_donations, total_units, monthly_counts, refreshed_at)
  select true, count(*)::bigint, coalesce(sum(units), 0)::bigint, monthly, now()
  from public.donations
  on conflict (id) do update set
    total_donations = excluded.total_donations,
    total_units = excluded.total_units,
    monthly_counts = excluded.monthly_counts,
    refreshed_at = excluded.refreshed_at;
end;
$$;
revoke all on function private.rebuild_donation_dashboard_stats() from public, anon, authenticated;

create or replace function private.refresh_donation_dashboard_stats_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.rebuild_donation_dashboard_stats();
  return null;
end;
$$;
revoke all on function private.refresh_donation_dashboard_stats_after_change() from public, anon, authenticated;

drop trigger if exists refresh_donation_dashboard_stats on public.donations;
create trigger refresh_donation_dashboard_stats
  after insert or update or delete on public.donations
  for each statement execute function private.refresh_donation_dashboard_stats_after_change();

select private.rebuild_donation_dashboard_stats();
