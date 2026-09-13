-- =========================================================
-- RZE Bank — Phase 6: customer lifecycle, extended transaction
-- types, extended request types, admin balance adjustments
-- Run this in the Supabase SQL editor after 0004.
--
-- PURELY ADDITIVE, with one correction: admin_review_service_request
-- (originally defined in 0004) is redefined here via CREATE OR REPLACE
-- to delegate to the existing approve_deposit / reject_deposit /
-- approve_loan / reject_loan functions from 0003 instead of
-- duplicating their balance-credit logic. This fixes a mistake in
-- 0004 — it should have reused those functions from the start.
-- =========================================================

-- ---------------------------------------------------------
-- Customer lifecycle
-- ---------------------------------------------------------
do $$ begin
  create type customer_status as enum ('pending', 'active', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

alter table customers add column if not exists status customer_status not null default 'active';
alter table customers add column if not exists deleted_at timestamptz;
alter table customers add column if not exists status_reason text;

create index if not exists idx_customers_status on customers (status) where deleted_at is null;

-- ---------------------------------------------------------
-- accounts.branch — was missing from 0001; ifsc already existed
-- ---------------------------------------------------------
alter table accounts add column if not exists branch text not null default 'Chennai Main Branch';

-- ---------------------------------------------------------
-- Extra transaction types: admin-initiated credit/debit and
-- interest credit. ALTER TYPE ... ADD VALUE can't run inside the
-- same transaction as a later statement that *uses* the new value,
-- but a plain migration file (each statement auto-committed) is fine.
-- ---------------------------------------------------------
alter type txn_type add value if not exists 'admin_credit';
alter type txn_type add value if not exists 'admin_debit';
alter type txn_type add value if not exists 'interest_credit';

-- ---------------------------------------------------------
-- Extra service request types
-- ---------------------------------------------------------
alter type service_request_type add value if not exists 'debit_card_request';
alter type service_request_type add value if not exists 'credit_card_request';
alter type service_request_type add value if not exists 'cheque_book_request';
alter type service_request_type add value if not exists 'mobile_change';
alter type service_request_type add value if not exists 'email_change';
alter type service_request_type add value if not exists 'account_closure';
alter type service_request_type add value if not exists 'complaint';

-- ---------------------------------------------------------
-- Extra request statuses (customer-facing "needs more info",
-- and admin-facing "closed" for complaints that don't resolve
-- to a simple approve/reject)
-- ---------------------------------------------------------
alter type request_status add value if not exists 'needs_info';
alter type request_status add value if not exists 'closed';

-- =========================================================
-- Admin balance adjustment (admin_credit / admin_debit / interest_credit)
-- =========================================================
create or replace function admin_adjust_balance(
  p_account_id uuid,
  p_amount numeric,
  p_txn_type txn_type, -- 'admin_credit' | 'admin_debit' | 'interest_credit'
  p_note text default null
) returns void as $$
declare
  admin_row admin_users%rowtype;
  acct accounts%rowtype;
  new_balance numeric;
begin
  if not is_admin() then
    raise exception 'Only admins can adjust balances';
  end if;
  if p_txn_type not in ('admin_credit', 'admin_debit', 'interest_credit') then
    raise exception 'Invalid adjustment type';
  end if;
  if p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  select * into admin_row from admin_users where auth_user_id = auth.uid();
  select * into acct from accounts where id = p_account_id for update;
  if not found then
    raise exception 'Account not found';
  end if;

  if p_txn_type = 'admin_debit' then
    if acct.balance < p_amount then
      raise exception 'Insufficient balance for debit';
    end if;
    new_balance := acct.balance - p_amount;
  else
    new_balance := acct.balance + p_amount;
  end if;

  update accounts set balance = new_balance, updated_at = now() where id = acct.id;

  insert into transactions (account_id, type, amount, status, reference_note)
  values (acct.id, p_txn_type, p_amount, 'success', coalesce(p_note, initcap(replace(p_txn_type::text, '_', ' '))));

  insert into notifications (customer_id, title, body)
  values (
    acct.customer_id,
    case when p_txn_type = 'admin_debit' then 'Amount Debited' else 'Amount Credited' end,
    '₹' || p_amount || ' was ' || (case when p_txn_type = 'admin_debit' then 'debited from' else 'credited to' end) ||
      ' your account.' || coalesce(' Note: ' || p_note, '')
  );

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (
    admin_row.id, p_txn_type::text, 'account', acct.id,
    'Adjusted balance by ' || p_amount || ' (' || p_txn_type::text || ')' || coalesce(' — ' || p_note, '')
  );
end;
$$ language plpgsql security definer;

revoke all on function admin_adjust_balance from public, anon, authenticated;
grant execute on function admin_adjust_balance to authenticated;

-- =========================================================
-- Admin customer lifecycle (approve / reject / suspend / activate / soft-delete)
-- =========================================================
create or replace function admin_set_customer_status(
  p_customer_id uuid,
  p_new_status customer_status,
  p_reason text default null
) returns void as $$
declare
  admin_row admin_users%rowtype;
  cust customers%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can change customer status';
  end if;

  select * into admin_row from admin_users where auth_user_id = auth.uid();
  select * into cust from customers where id = p_customer_id for update;
  if not found then
    raise exception 'Customer not found';
  end if;

  update customers set status = p_new_status, status_reason = p_reason where id = cust.id;

  -- Freeze/unfreeze the customer's accounts alongside suspension,
  -- reusing the existing account_status enum/column as-is.
  if p_new_status = 'suspended' then
    update accounts set status = 'frozen', updated_at = now() where customer_id = cust.id and status = 'active';
  elsif p_new_status = 'active' then
    update accounts set status = 'active', updated_at = now() where customer_id = cust.id and status = 'frozen';
  end if;

  insert into notifications (customer_id, title, body)
  values (
    cust.id,
    'Account Status Updated',
    'Your account status is now "' || p_new_status::text || '".' || coalesce(' ' || p_reason, '')
  );

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (
    admin_row.id, 'set_customer_status', 'customer', cust.id,
    'Set status to ' || p_new_status::text || coalesce(' — ' || p_reason, '')
  );
end;
$$ language plpgsql security definer;

revoke all on function admin_set_customer_status from public, anon, authenticated;
grant execute on function admin_set_customer_status to authenticated;

create or replace function admin_soft_delete_customer(p_customer_id uuid, p_reason text default null)
returns void as $$
declare
  admin_row admin_users%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can delete customers';
  end if;

  select * into admin_row from admin_users where auth_user_id = auth.uid();

  update customers set deleted_at = now(), status_reason = p_reason where id = p_customer_id;
  update accounts set status = 'closed', updated_at = now() where customer_id = p_customer_id;

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'soft_delete_customer', 'customer', p_customer_id, coalesce(p_reason, ''));
end;
$$ language plpgsql security definer;

revoke all on function admin_soft_delete_customer from public, anon, authenticated;
grant execute on function admin_soft_delete_customer to authenticated;

-- =========================================================
-- Corrected admin_review_service_request — delegates to the
-- existing 0003 approval functions instead of duplicating them.
-- =========================================================
create or replace function admin_review_service_request(
  p_request_id uuid,
  p_new_status request_status,
  p_admin_message text default null
) returns void as $$
declare
  req service_requests%rowtype;
  admin_row admin_users%rowtype;
  log_action text;
begin
  if not is_admin() then
    raise exception 'Only admins can review requests';
  end if;

  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into req from service_requests where id = p_request_id for update;
  if not found then
    raise exception 'Request not found';
  end if;
  if req.status <> 'pending' then
    raise exception 'Request has already been reviewed';
  end if;

  update service_requests
    set status = p_new_status,
        admin_message = p_admin_message,
        reviewed_by = admin_row.id
    where id = p_request_id;

  -- Delegate to the existing 0003 functions — they already handle
  -- the balance credit and their own customer notification, so we
  -- must NOT insert a second notification in these two branches.
  if req.source_table = 'deposits' and req.source_id is not null then
    if p_new_status = 'approved' then
      perform approve_deposit(req.source_id, admin_row.id);
    elsif p_new_status = 'rejected' then
      perform reject_deposit(req.source_id, admin_row.id);
    end if;

  elsif req.source_table = 'loans' and req.source_id is not null then
    if p_new_status = 'approved' then
      perform approve_loan(req.source_id);
    elsif p_new_status = 'rejected' then
      perform reject_loan(req.source_id);
    end if;

  elsif req.source_table = 'withdrawals' and req.source_id is not null then
    -- No dedicated approval function exists yet for withdrawals
    -- (they're QR/ATM based, not credit-affecting) — update status
    -- directly and send our own notification below.
    update withdrawals set status = p_new_status where id = req.source_id;
    insert into notifications (customer_id, title, body)
    values (
      req.customer_id,
      case when p_new_status = 'approved' then 'Withdrawal Approved' else 'Withdrawal Rejected' end,
      case when p_new_status = 'approved' then 'Your withdrawal request has been approved.'
        else 'Your withdrawal request was rejected.' || coalesce(' Reason: ' || p_admin_message, '') end
    );

  else
    -- account_creation / profile_update / account_upgrade / debit_card_request /
    -- credit_card_request / cheque_book_request / mobile_change / email_change /
    -- account_closure / complaint — service_requests IS the source of truth,
    -- so send the notification directly.
    insert into notifications (customer_id, title, body)
    values (
      req.customer_id,
      case when p_new_status = 'approved' then 'Request Approved' else 'Request Rejected' end,
      case when p_new_status = 'approved'
        then 'Your ' || replace(req.request_type::text, '_', ' ') || ' request has been approved.'
        else 'Your ' || replace(req.request_type::text, '_', ' ') || ' request was rejected.' ||
             coalesce(' Reason: ' || p_admin_message, '')
      end
    );
  end if;

  log_action := case when p_new_status = 'approved' then 'approve_request' else 'reject_request' end;
  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (
    admin_row.id,
    log_action,
    'service_request',
    p_request_id,
    'Reviewed ' || req.request_type::text || ' request for customer ' || req.customer_id::text ||
      coalesce(' — ' || p_admin_message, '')
  );
end;
$$ language plpgsql security definer;

revoke all on function admin_review_service_request from public, anon, authenticated;
grant execute on function admin_review_service_request to authenticated;
