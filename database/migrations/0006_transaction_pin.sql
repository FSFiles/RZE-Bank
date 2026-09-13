-- =========================================================
-- RZE Bank — Transaction PIN support
-- Run after 0005. Needed because the customer portal's "hide
-- balance behind a PIN" and "PIN-protected transfer" features
-- (built during the mock phase) have no real backing column yet.
-- =========================================================

create extension if not exists pgcrypto;

alter table customers add column if not exists transaction_pin_hash text;

-- ---------------------------------------------------------
-- set_transaction_pin — customer sets/changes their own PIN.
-- Callable by the customer themselves only (checks auth.uid()
-- against the row's auth_user_id, no admin bypass needed).
-- ---------------------------------------------------------
create or replace function set_transaction_pin(p_pin text) returns void as $$
declare
  cust customers%rowtype;
begin
  if p_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;

  select * into cust from customers where auth_user_id = auth.uid();
  if not found then
    raise exception 'No customer profile for this session';
  end if;

  update customers set transaction_pin_hash = crypt(p_pin, gen_salt('bf', 8)) where id = cust.id;
end;
$$ language plpgsql security definer;

revoke all on function set_transaction_pin from public, anon, authenticated;
grant execute on function set_transaction_pin to authenticated;

-- ---------------------------------------------------------
-- verify_transaction_pin — returns true/false, never leaks the
-- hash itself. Used before revealing the balance and before
-- confirming a transfer.
-- ---------------------------------------------------------
create or replace function verify_transaction_pin(p_pin text) returns boolean as $$
declare
  cust customers%rowtype;
begin
  select * into cust from customers where auth_user_id = auth.uid();
  if not found or cust.transaction_pin_hash is null then
    return false;
  end if;
  return cust.transaction_pin_hash = crypt(p_pin, cust.transaction_pin_hash);
end;
$$ language plpgsql security definer;

revoke all on function verify_transaction_pin from public, anon, authenticated;
grant execute on function verify_transaction_pin to authenticated;

create or replace function has_transaction_pin() returns boolean as $$
  select transaction_pin_hash is not null from customers where auth_user_id = auth.uid();
$$ language sql security definer stable;

revoke all on function has_transaction_pin from public, anon, authenticated;
grant execute on function has_transaction_pin to authenticated;
