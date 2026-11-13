-- Let signed-in donors report their completed donations while preserving private history.
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

-- Keep profile counters in sync without granting clients permission to edit those fields.
create or replace function private.sync_donor_profile_after_donation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_user_id uuid;
begin
  affected_user_id := new.user_id;
  update public.profiles
  set donation_count = donation_count + 1,
      last_donation = greatest(last_donation, new.donated_on)
  where id = affected_user_id;
  return new;
end;
$$;

revoke all on function private.sync_donor_profile_after_donation() from public, anon, authenticated;
drop trigger if exists sync_donor_profile_after_donation on public.donations;
create trigger sync_donor_profile_after_donation
  after insert on public.donations
  for each row execute function private.sync_donor_profile_after_donation();
