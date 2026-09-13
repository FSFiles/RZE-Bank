-- =========================================================
-- RZE Bank — Dedicated Deposit & Loan admin review workflow
-- Run this in the Supabase SQL editor after 0006_transaction_pin.sql
--
-- PURELY ADDITIVE. Adds:
--   1. loans.cibil_score + review/audit columns
--   2. deposits.rejection_reason
--   3. loans.loan_category (free-text label chosen in the Loans UI —
--      the loan_type enum stays as a coarse bucket for reporting)
--   4. Dedicated admin RPCs so the Admin Portal's new /deposits and
--      /loans pages can act directly on a deposit/loan row (instead
--      of going through the generic service_requests queue), while
--      still keeping the linked service_requests row in sync so the
--      unified Requests page and customer-facing status stay correct.
-- =========================================================

-- ---------------------------------------------------------
-- Columns
-- ---------------------------------------------------------
alter table loans add column if not exists cibil_score integer
  check (cibil_score is null or (cibil_score >= 300 and cibil_score <= 900));
alter table loans add column if not exists loan_category text;
alter table loans add column if not exists reviewed_by uuid references admin_users(id);
alter table loans add column if not exists reviewed_at timestamptz;
alter table loans add column if not exists rejection_reason text;

alter table deposits add column if not exists rejection_reason text;

create index if not exists idx_loans_cibil_score on loans (cibil_score);

-- ---------------------------------------------------------
-- Deposits: admin approve / reject
-- Wraps the same logic as approve_deposit / reject_deposit from
-- 0003, but callable directly by an authenticated admin (checks
-- is_admin() itself), and also mirrors the outcome into the linked
-- service_requests row + writes an audit log entry.
-- ---------------------------------------------------------
create or replace function admin_approve_deposit(p_deposit_id uuid)
returns table (out_status text, out_message text) as $$
declare
  admin_row admin_users%rowtype;
  dep deposits%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can review deposits';
  end if;
  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into dep from deposits where id = p_deposit_id for update;
  if not found then
    return query select 'error', 'Deposit request not found';
    return;
  end if;
  if dep.status <> 'pending' then
    return query select 'error', 'Deposit request has already been reviewed';
    return;
  end if;

  update accounts set balance = balance + dep.amount, updated_at = now() where id = dep.account_id;
  update deposits set status = 'approved', reviewed_by = admin_row.id, reviewed_at = now()
    where id = dep.id;

  insert into transactions (account_id, type, amount, status, reference_note)
  values (dep.account_id, 'deposit', dep.amount, 'success', 'Deposit approved');

  insert into notifications (customer_id, title, body)
  select a.customer_id, 'Deposit Approved', 'Your deposit of ₹' || dep.amount || ' has been credited.'
  from accounts a where a.id = dep.account_id;

  update service_requests
    set status = 'approved', reviewed_by = admin_row.id
    where source_table = 'deposits' and source_id = dep.id and status = 'pending';

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'approve_request', 'deposit', dep.id, 'Approved deposit of ₹' || dep.amount);

  return query select 'success', 'Deposit approved and credited';
end;
$$ language plpgsql security definer;

revoke all on function admin_approve_deposit from public, anon, authenticated;
grant execute on function admin_approve_deposit to authenticated; -- is_admin() check happens inside

create or replace function admin_reject_deposit(p_deposit_id uuid, p_reason text default null)
returns table (out_status text, out_message text) as $$
declare
  admin_row admin_users%rowtype;
  dep deposits%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can review deposits';
  end if;
  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into dep from deposits where id = p_deposit_id for update;
  if not found then
    return query select 'error', 'Deposit request not found';
    return;
  end if;
  if dep.status <> 'pending' then
    return query select 'error', 'Deposit request has already been reviewed';
    return;
  end if;

  update deposits
    set status = 'rejected', reviewed_by = admin_row.id, reviewed_at = now(), rejection_reason = p_reason
    where id = dep.id;

  insert into notifications (customer_id, title, body)
  select a.customer_id, 'Deposit Rejected',
    'Your deposit request of ₹' || dep.amount || ' was rejected.' || coalesce(' Reason: ' || p_reason, '')
  from accounts a where a.id = dep.account_id;

  update service_requests
    set status = 'rejected', admin_message = p_reason, reviewed_by = admin_row.id
    where source_table = 'deposits' and source_id = dep.id and status = 'pending';

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'reject_request', 'deposit', dep.id,
    'Rejected deposit of ₹' || dep.amount || coalesce(' — ' || p_reason, ''));

  return query select 'success', 'Deposit rejected';
end;
$$ language plpgsql security definer;

revoke all on function admin_reject_deposit from public, anon, authenticated;
grant execute on function admin_reject_deposit to authenticated;

-- ---------------------------------------------------------
-- Loans: admin sets the CIBIL score, then approves / rejects
-- ---------------------------------------------------------
create or replace function admin_set_loan_cibil_score(p_loan_id uuid, p_score integer)
returns table (out_status text, out_message text) as $$
declare
  admin_row admin_users%rowtype;
  ln loans%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can update CIBIL scores';
  end if;
  if p_score is null or p_score < 300 or p_score > 900 then
    return query select 'error', 'CIBIL score must be between 300 and 900';
    return;
  end if;
  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into ln from loans where id = p_loan_id for update;
  if not found then
    return query select 'error', 'Loan application not found';
    return;
  end if;
  if ln.status <> 'pending' then
    return query select 'error', 'Loan application has already been reviewed';
    return;
  end if;

  update loans set cibil_score = p_score where id = ln.id;

  update service_requests
    set request_details = request_details || jsonb_build_object('cibilScore', p_score)
    where source_table = 'loans' and source_id = ln.id and status = 'pending';

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'set_cibil_score', 'loan', ln.id, 'Recorded CIBIL score ' || p_score);

  return query select 'success', 'CIBIL score saved';
end;
$$ language plpgsql security definer;

revoke all on function admin_set_loan_cibil_score from public, anon, authenticated;
grant execute on function admin_set_loan_cibil_score to authenticated;

create or replace function admin_approve_loan(p_loan_id uuid)
returns table (out_status text, out_message text) as $$
declare
  admin_row admin_users%rowtype;
  ln loans%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can review loans';
  end if;
  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into ln from loans where id = p_loan_id for update;
  if not found then
    return query select 'error', 'Loan application not found';
    return;
  end if;
  if ln.status <> 'pending' then
    return query select 'error', 'Loan application has already been reviewed';
    return;
  end if;
  if ln.cibil_score is null then
    return query select 'error', 'Enter the CIBIL score before approving';
    return;
  end if;

  update loans set status = 'approved', reviewed_by = admin_row.id, reviewed_at = now() where id = ln.id;

  insert into notifications (customer_id, title, body)
  values (
    ln.customer_id, 'Loan Approved',
    'Your ' || coalesce(ln.loan_category, ln.loan_type::text) || ' application for ₹' || ln.amount ||
      ' was approved. CIBIL score on file: ' || ln.cibil_score || '.'
  );

  update service_requests
    set status = 'approved', reviewed_by = admin_row.id
    where source_table = 'loans' and source_id = ln.id and status = 'pending';

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'approve_request', 'loan', ln.id,
    'Approved loan of ₹' || ln.amount || ' (CIBIL ' || ln.cibil_score || ')');

  return query select 'success', 'Loan approved';
end;
$$ language plpgsql security definer;

revoke all on function admin_approve_loan from public, anon, authenticated;
grant execute on function admin_approve_loan to authenticated;

create or replace function admin_reject_loan(p_loan_id uuid, p_reason text default null)
returns table (out_status text, out_message text) as $$
declare
  admin_row admin_users%rowtype;
  ln loans%rowtype;
begin
  if not is_admin() then
    raise exception 'Only admins can review loans';
  end if;
  select * into admin_row from admin_users where auth_user_id = auth.uid();

  select * into ln from loans where id = p_loan_id for update;
  if not found then
    return query select 'error', 'Loan application not found';
    return;
  end if;
  if ln.status <> 'pending' then
    return query select 'error', 'Loan application has already been reviewed';
    return;
  end if;

  update loans
    set status = 'rejected', reviewed_by = admin_row.id, reviewed_at = now(), rejection_reason = p_reason
    where id = ln.id;

  insert into notifications (customer_id, title, body)
  values (
    ln.customer_id, 'Loan Rejected',
    'Your ' || coalesce(ln.loan_category, ln.loan_type::text) || ' application for ₹' || ln.amount ||
      ' was rejected.' || coalesce(' Reason: ' || p_reason, '')
  );

  update service_requests
    set status = 'rejected', admin_message = p_reason, reviewed_by = admin_row.id
    where source_table = 'loans' and source_id = ln.id and status = 'pending';

  insert into admin_activity_logs (admin_id, action, target_type, target_id, description)
  values (admin_row.id, 'reject_request', 'loan', ln.id,
    'Rejected loan of ₹' || ln.amount || coalesce(' — ' || p_reason, ''));

  return query select 'success', 'Loan rejected';
end;
$$ language plpgsql security definer;

revoke all on function admin_reject_loan from public, anon, authenticated;
grant execute on function admin_reject_loan to authenticated;
