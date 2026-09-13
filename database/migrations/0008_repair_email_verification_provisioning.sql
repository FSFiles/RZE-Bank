-- =========================================================
-- RZE Bank — Repair: email-verification provisioning
-- Run this in the Supabase SQL editor.
--
-- Symptom this fixes: a user clicks the "confirm your email"
-- link, Supabase shows it as confirmed, but no Customer ID /
-- Account Number ever gets created, so they can't log in.
--
-- Root cause: Customer ID / Account Number are created by the
-- `on_auth_user_email_verified` trigger defined in 0001_init.sql,
-- which fires the moment auth.users.email_confirmed_at flips from
-- null -> not null. If that trigger was missing (or a stale
-- version) in the live database at the moment a given user
-- confirmed their email, the confirmation succeeds in Supabase
-- Auth but nothing ever creates their customer/account rows —
-- and since the trigger only fires on that one null -> not-null
-- transition, it will NOT retroactively fire just by re-running
-- this migration for users who already confirmed in the past.
--
-- This migration:
--   1. Re-installs the trigger/function (safe, idempotent — run
--      this any time you're not sure it's live) so all *future*
--      confirmations work correctly.
--   2. Adds `repair_stuck_customer(email)`, a one-off RPC you can
--      call for any already-confirmed user who is still missing
--      their customer/account rows, to provision them right now.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Re-install the trigger (identical to 0001_init.sql —
--    safe to re-run, `create or replace` + `drop ... if exists`).
-- ---------------------------------------------------------
create or replace function handle_email_verified() returns trigger as $$
declare
  pending pending_registrations%rowtype;
  new_customer_id uuid;
  gen_customer_code text;
  gen_account_number text;
begin
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then

    select * into pending from pending_registrations where auth_user_id = new.id;
    if not found then
      return new;
    end if;

    gen_customer_code := next_customer_id();

    insert into customers (
      auth_user_id, customer_id, first_name, last_name, phone_number, email,
      dob, gender, aadhaar_number, pan_number,
      address_line1, address_line2, city, state, pin_code, country
    ) values (
      new.id, gen_customer_code, pending.first_name, pending.last_name,
      pending.phone_number, new.email,
      pending.dob, pending.gender, pending.aadhaar_number, pending.pan_number,
      pending.address_line1, pending.address_line2, pending.city, pending.state,
      pending.pin_code, pending.country
    )
    returning id into new_customer_id;

    gen_account_number := next_account_number();

    insert into accounts (account_number, customer_id, account_type, ifsc, balance, status)
    values (gen_account_number, new_customer_id, pending.account_type, 'RZEB0001001', 0.00, 'active');

    insert into notifications (customer_id, title, body)
    values (new_customer_id, 'Welcome to RZE Bank',
      'Your account ' || gen_account_number || ' is now active.');

    delete from pending_registrations where auth_user_id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
  after update on auth.users
  for each row execute function handle_email_verified();

-- ---------------------------------------------------------
-- 2. Backfill RPC for users already confirmed before the fix.
--    Run: select * from repair_stuck_customer('someone@example.com');
-- ---------------------------------------------------------
create or replace function repair_stuck_customer(p_email text)
returns table (out_customer_id text, out_account_number text) as $$
declare
  target_user_id uuid;
  pending pending_registrations%rowtype;
  new_customer_id uuid;
  gen_customer_code text;
  gen_account_number text;
begin
  select id into target_user_id from auth.users where email = p_email;
  if target_user_id is null then
    raise exception 'No auth user found for email %', p_email;
  end if;

  if exists (select 1 from customers where auth_user_id = target_user_id) then
    raise exception 'This user already has a customer profile — nothing to repair';
  end if;

  select * into pending from pending_registrations where auth_user_id = target_user_id;
  if not found then
    raise exception 'No pending registration found for % — if they signed up with Google, use the Complete Profile flow in the app instead, not this RPC', p_email;
  end if;

  gen_customer_code := next_customer_id();

  insert into customers (
    auth_user_id, customer_id, first_name, last_name, phone_number, email,
    dob, gender, aadhaar_number, pan_number,
    address_line1, address_line2, city, state, pin_code, country
  ) values (
    target_user_id, gen_customer_code, pending.first_name, pending.last_name,
    pending.phone_number, p_email,
    pending.dob, pending.gender, pending.aadhaar_number, pending.pan_number,
    pending.address_line1, pending.address_line2, pending.city, pending.state,
    pending.pin_code, pending.country
  )
  returning id into new_customer_id;

  gen_account_number := next_account_number();

  insert into accounts (account_number, customer_id, account_type, ifsc, balance, status)
  values (gen_account_number, new_customer_id, pending.account_type, 'RZEB0001001', 0.00, 'active');

  insert into notifications (customer_id, title, body)
  values (new_customer_id, 'Welcome to RZE Bank',
    'Your account ' || gen_account_number || ' is now active.');

  delete from pending_registrations where auth_user_id = target_user_id;

  return query select gen_customer_code, gen_account_number;
end;
$$ language plpgsql security definer;

revoke all on function repair_stuck_customer from public, anon, authenticated;
