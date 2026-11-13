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
