-- Keep the six-month trend in the past instead of including future months.
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

select private.rebuild_donation_dashboard_stats();
