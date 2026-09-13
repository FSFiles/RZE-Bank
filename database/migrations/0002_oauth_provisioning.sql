-- =========================================================
-- RZE Bank — OAuth (Google) provisioning
-- Run this in the Supabase SQL editor after 0001_init.sql
--
-- Google sign-in already verifies the user's email, so the
-- `handle_email_verified` trigger (which fires on the
-- null -> not-null transition of auth.users.email_confirmed_at
-- on UPDATE) never fires for OAuth users — Supabase sets
-- email_confirmed_at at INSERT time for them, not UPDATE.
--
-- Instead, OAuth users complete a short KYC form after login
-- and the app calls this RPC directly to provision their
-- customer + account rows, reusing the same ID generators.
-- =========================================================

create or replace function provision_customer(
  p_auth_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_phone_number text,
  p_email text,
  p_dob date,
  p_gender gender_type,
  p_aadhaar_number text,
  p_pan_number text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_state text,
  p_pin_code text,
  p_country text,
  p_account_type account_type
) returns table (out_customer_id text, out_account_number text) as $$
declare
  new_customer_id uuid;
  gen_customer_code text;
  gen_account_number text;
begin
  if exists (select 1 from customers where auth_user_id = p_auth_user_id) then
    raise exception 'A banking profile already exists for this user';
  end if;

  gen_customer_code := next_customer_id();

  insert into customers (
    auth_user_id, customer_id, first_name, last_name, phone_number, email,
    dob, gender, aadhaar_number, pan_number,
    address_line1, address_line2, city, state, pin_code, country
  ) values (
    p_auth_user_id, gen_customer_code, p_first_name, p_last_name, p_phone_number, p_email,
    p_dob, p_gender, p_aadhaar_number, p_pan_number,
    p_address_line1, p_address_line2, p_city, p_state, p_pin_code, p_country
  )
  returning id into new_customer_id;

  gen_account_number := next_account_number();

  insert into accounts (account_number, customer_id, account_type, ifsc, balance, status)
  values (gen_account_number, new_customer_id, p_account_type, 'RZEB0001001', 0.00, 'active');

  insert into notifications (customer_id, title, body)
  values (new_customer_id, 'Welcome to RZE Bank',
    'Your account ' || gen_account_number || ' is now active.');

  return query select gen_customer_code, gen_account_number;
end;
$$ language plpgsql security definer;

-- Only the service role should ever call this (we call it from a
-- server action using the admin client), so revoke it from the
-- regular authenticated/anon roles.
revoke all on function provision_customer from public, anon, authenticated;
