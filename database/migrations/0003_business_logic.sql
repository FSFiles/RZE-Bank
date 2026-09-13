-- =========================================================
-- RZE Bank — Business logic (deposits, withdrawals, transfers,
-- loans, notifications, profile/settings)
-- Run this in the Supabase SQL editor after 0002_oauth_provisioning.sql
-- =========================================================

-- ---------------------------------------------------------
-- Extra columns
-- ---------------------------------------------------------
alter table accounts add column if not exists upi_id text unique;

alter table customers add column if not exists notification_preferences jsonb
  not null default '{"email": true, "sms": true, "push": true}'::jsonb;

alter table customers add column if not exists security_settings jsonb
  not null default '{"two_factor_enabled": false}'::jsonb;

-- ---------------------------------------------------------
-- Indexes to support search/filter/sort/pagination
-- ---------------------------------------------------------
create index if not exists idx_transactions_type on transactions (type);
create index if not exists idx_transactions_status on transactions (status);
create index if not exists idx_deposits_status on deposits (status);
create index if not exists idx_deposits_account on deposits (account_id, created_at desc);
create index if not exists idx_withdrawals_status on withdrawals (status);
create index if not exists idx_withdrawals_account on withdrawals (account_id, created_at desc);
create index if not exists idx_loans_status on loans (status);
create index if not exists idx_loans_customer_created on loans (customer_id, created_at desc);
create index if not exists idx_notifications_customer_created on notifications (customer_id, created_at desc);
create index if not exists idx_accounts_upi on accounts (upi_id);

-- ---------------------------------------------------------
-- Backfill + auto-generate UPI IDs going forward
-- Format: {account_number}@rzebank
-- ---------------------------------------------------------
update accounts set upi_id = lower(account_number) || '@rzebank' where upi_id is null;

create or replace function set_account_upi_id() returns trigger as $$
begin
  if new.upi_id is null then
    new.upi_id := lower(new.account_number) || '@rzebank';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_account_insert_set_upi on accounts;
create trigger on_account_insert_set_upi
  before insert on accounts
  for each row execute function set_account_upi_id();

-- ---------------------------------------------------------
-- Withdrawal ID generator: RZE-WD-000001
-- ---------------------------------------------------------
create sequence if not exists withdrawal_id_seq start 1;

create or replace function next_withdrawal_id() returns text as $$
  select 'RZE-WD-' || lpad(nextval('withdrawal_id_seq')::text, 6, '0');
$$ language sql;

-- ---------------------------------------------------------
-- Transfer: atomic debit + credit + two transaction rows +
-- two notifications. Resolves the receiver account by account
-- number, phone number, or UPI ID (whichever is provided).
-- ---------------------------------------------------------
create or replace function process_transfer(
  p_sender_account_id uuid,
  p_receiver_identifier text,
  p_identifier_type text, -- 'account_number' | 'phone_number' | 'upi_id'
  p_amount numeric,
  p_note text default null
) returns table (
  out_status text,
  out_message text,
  out_transaction_id uuid,
  out_receiver_name text
) as $$
declare
  sender accounts%rowtype;
  receiver accounts%rowtype;
  receiver_customer customers%rowtype;
  sender_customer customers%rowtype;
  new_txn_id uuid;
begin
  if p_amount <= 0 then
    return query select 'error', 'Amount must be greater than zero', null::uuid, null::text;
    return;
  end if;

  select * into sender from accounts where id = p_sender_account_id for update;
  if not found then
    return query select 'error', 'Sender account not found', null::uuid, null::text;
    return;
  end if;

  if sender.status <> 'active' then
    return query select 'error', 'Sender account is not active', null::uuid, null::text;
    return;
  end if;

  if p_identifier_type = 'account_number' then
    select * into receiver from accounts where account_number = p_receiver_identifier for update;
  elsif p_identifier_type = 'phone_number' then
    select a.* into receiver from accounts a
      join customers c on c.id = a.customer_id
      where c.phone_number = p_receiver_identifier for update;
  elsif p_identifier_type = 'upi_id' then
    select * into receiver from accounts where upi_id = p_receiver_identifier for update;
  else
    return query select 'error', 'Invalid identifier type', null::uuid, null::text;
    return;
  end if;

  if not found then
    return query select 'error', 'Receiver account not found', null::uuid, null::text;
    return;
  end if;

  if receiver.id = sender.id then
    return query select 'error', 'Cannot transfer to your own account', null::uuid, null::text;
    return;
  end if;

  if receiver.status <> 'active' then
    return query select 'error', 'Receiver account is not active', null::uuid, null::text;
    return;
  end if;

  if sender.balance < p_amount then
    return query select 'error', 'Insufficient balance', null::uuid, null::text;
    return;
  end if;

  update accounts set balance = balance - p_amount, updated_at = now() where id = sender.id;
  update accounts set balance = balance + p_amount, updated_at = now() where id = receiver.id;

  insert into transactions (account_id, counterparty_account_id, type, amount, status, reference_note)
  values (sender.id, receiver.id, 'transfer_out', p_amount, 'success', p_note)
  returning id into new_txn_id;

  insert into transactions (account_id, counterparty_account_id, type, amount, status, reference_note)
  values (receiver.id, sender.id, 'transfer_in', p_amount, 'success', p_note);

  select * into sender_customer from customers where id = sender.customer_id;
  select * into receiver_customer from customers where id = receiver.customer_id;

  insert into notifications (customer_id, title, body) values (
    sender.customer_id, 'Transfer Successful',
    'You sent ₹' || p_amount || ' to ' || receiver_customer.first_name || ' ' || receiver_customer.last_name
  );
  insert into notifications (customer_id, title, body) values (
    receiver.customer_id, 'Money Received',
    'You received ₹' || p_amount || ' from ' || sender_customer.first_name || ' ' || sender_customer.last_name
  );

  return query select 'success', 'Transfer completed', new_txn_id,
    (receiver_customer.first_name || ' ' || receiver_customer.last_name);
end;
$$ language plpgsql security definer;

revoke all on function process_transfer from public, anon, authenticated;

-- ---------------------------------------------------------
-- Deposit approval workflow (admin-only, called via service role)
-- ---------------------------------------------------------
create or replace function approve_deposit(p_deposit_id uuid, p_reviewer uuid default null)
returns table (out_status text, out_message text) as $$
declare
  dep deposits%rowtype;
begin
  select * into dep from deposits where id = p_deposit_id for update;
  if not found then
    return query select 'error', 'Deposit request not found';
    return;
  end if;
  if dep.status <> 'pending' then
    return query select 'error', 'Deposit request is not pending';
    return;
  end if;

  update accounts set balance = balance + dep.amount, updated_at = now() where id = dep.account_id;
  update deposits set status = 'approved', reviewed_by = p_reviewer, reviewed_at = now() where id = dep.id;

  insert into transactions (account_id, type, amount, status, reference_note)
  values (dep.account_id, 'deposit', dep.amount, 'success', 'Deposit approved');

  insert into notifications (customer_id, title, body)
  select a.customer_id, 'Deposit Approved', 'Your deposit of ₹' || dep.amount || ' has been credited.'
  from accounts a where a.id = dep.account_id;

  return query select 'success', 'Deposit approved and credited';
end;
$$ language plpgsql security definer;

revoke all on function approve_deposit from public, anon, authenticated;

create or replace function reject_deposit(p_deposit_id uuid, p_reviewer uuid default null)
returns table (out_status text, out_message text) as $$
declare
  dep deposits%rowtype;
begin
  select * into dep from deposits where id = p_deposit_id for update;
  if not found then
    return query select 'error', 'Deposit request not found';
    return;
  end if;
  if dep.status <> 'pending' then
    return query select 'error', 'Deposit request is not pending';
    return;
  end if;

  update deposits set status = 'rejected', reviewed_by = p_reviewer, reviewed_at = now() where id = dep.id;

  insert into notifications (customer_id, title, body)
  select a.customer_id, 'Deposit Rejected', 'Your deposit request of ₹' || dep.amount || ' was rejected.'
  from accounts a where a.id = dep.account_id;

  return query select 'success', 'Deposit rejected';
end;
$$ language plpgsql security definer;

revoke all on function reject_deposit from public, anon, authenticated;

-- ---------------------------------------------------------
-- Loan approval workflow
-- ---------------------------------------------------------
create or replace function approve_loan(p_loan_id uuid) returns table (out_status text, out_message text) as $$
declare
  ln loans%rowtype;
begin
  select * into ln from loans where id = p_loan_id for update;
  if not found then
    return query select 'error', 'Loan application not found';
    return;
  end if;
  if ln.status <> 'pending' then
    return query select 'error', 'Loan application is not pending';
    return;
  end if;

  update loans set status = 'approved' where id = ln.id;

  insert into notifications (customer_id, title, body)
  values (ln.customer_id, 'Loan Approved', 'Your ' || ln.loan_type || ' loan application for ₹' || ln.amount || ' was approved.');

  return query select 'success', 'Loan approved';
end;
$$ language plpgsql security definer;

revoke all on function approve_loan from public, anon, authenticated;

create or replace function reject_loan(p_loan_id uuid) returns table (out_status text, out_message text) as $$
declare
  ln loans%rowtype;
begin
  select * into ln from loans where id = p_loan_id for update;
  if not found then
    return query select 'error', 'Loan application not found';
    return;
  end if;
  if ln.status <> 'pending' then
    return query select 'error', 'Loan application is not pending';
    return;
  end if;

  update loans set status = 'rejected' where id = ln.id;

  insert into notifications (customer_id, title, body)
  values (ln.customer_id, 'Loan Rejected', 'Your ' || ln.loan_type || ' loan application for ₹' || ln.amount || ' was rejected.');

  return query select 'success', 'Loan rejected';
end;
$$ language plpgsql security definer;

revoke all on function reject_loan from public, anon, authenticated;
