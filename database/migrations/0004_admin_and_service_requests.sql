-- =========================================================
-- RZE Bank — Admin system + unified service request queue
-- Run this in the Supabase SQL editor after 0003_business_logic.sql
--
-- PURELY ADDITIVE. Nothing in 0001/0002/0003 is altered, dropped,
-- or replaced. Existing tables (customers, accounts, transactions,
-- deposits, withdrawals, loans, notifications) and the existing
-- process_transfer / provision_customer RPCs are untouched and
-- still the source of truth for their respective operations.
-- =========================================================

-- ---------------------------------------------------------
-- Enums
-- ---------------------------------------------------------
do $$ begin
  create type service_request_type as enum (
    'account_creation',
    'deposit_request',
    'withdrawal_request',
    'loan_request',
    'profile_update',
    'account_upgrade'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type service_request_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('admin');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------
-- admin_users
-- Completely separate from `customers`. One row per bank
-- staff member, linked 1:1 to a Supabase Auth user. There is
-- no public sign-up path — rows are inserted manually (see
-- "Admin creation" note at the bottom of this file).
-- ---------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- security-definer helper so RLS policies (on this table and
-- every other table below) can check "is the caller an admin?"
-- without recursively hitting RLS on admin_users itself.
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from admin_users where auth_user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------
-- service_requests
-- The unified queue the Admin Portal's Requests page reads
-- from. For request types that already have a dedicated
-- operational table (deposit_request / withdrawal_request /
-- loan_request), `source_table` + `source_id` point at the
-- real row in `deposits` / `withdrawals` / `loans` so approving
-- here also updates that row (via the RPC below) — the
-- existing tables remain the source of truth for the money
-- movement itself. account_creation / profile_update /
-- account_upgrade have no existing table, so service_requests
-- IS the source of truth for those.
-- ---------------------------------------------------------
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  request_type service_request_type not null,
  request_details jsonb not null default '{}'::jsonb,
  priority service_request_priority not null default 'medium',
  source_table text,           -- 'deposits' | 'withdrawals' | 'loans' | null
  source_id uuid,               -- id of the row in that table, if any
  status request_status not null default 'pending', -- reuses existing enum
  admin_message text,
  reviewed_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_requests_customer on service_requests (customer_id, created_at desc);
create index if not exists idx_service_requests_status on service_requests (status);
create index if not exists idx_service_requests_type on service_requests (request_type);
create index if not exists idx_service_requests_priority on service_requests (priority);
create index if not exists idx_service_requests_status_priority on service_requests (status, priority);

create or replace function touch_service_requests_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_service_requests_update on service_requests;
create trigger on_service_requests_update
  before update on service_requests
  for each row execute function touch_service_requests_updated_at();

-- ---------------------------------------------------------
-- admin_activity_logs
-- Append-only audit trail of every admin action. Written to
-- exclusively from admin_review_service_request (and any future
-- admin RPCs) via SECURITY DEFINER — never directly by the app,
-- so it can't be tampered with from the client.
-- ---------------------------------------------------------
create table if not exists admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admin_users(id) on delete cascade,
  action text not null,          -- e.g. 'approve_request', 'reject_request'
  target_type text not null,     -- e.g. 'service_request', 'customer', 'account'
  target_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_activity_logs_admin on admin_activity_logs (admin_id, created_at desc);
create index if not exists idx_admin_activity_logs_target on admin_activity_logs (target_type, target_id);

-- =========================================================
-- Admin review RPC
-- Single entry point for Approve / Reject in the Admin Portal.
-- SECURITY DEFINER so it can update the linked deposits /
-- withdrawals / loans row (customers have no direct UPDATE
-- grant on those), insert the customer notification, and write
-- the audit log row, all atomically. Reuses the existing
-- tables/columns as-is.
-- =========================================================
create or replace function admin_review_service_request(
  p_request_id uuid,
  p_new_status request_status, -- 'approved' | 'rejected'
  p_admin_message text default null
) returns void as $$
declare
  req service_requests%rowtype;
  admin_row admin_users%rowtype;
  acct accounts%rowtype;
  notif_title text;
  notif_body text;
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

  -- Mirror the decision into the linked operational row, if any.
  if req.source_table = 'deposits' and req.source_id is not null then
    update deposits set status = p_new_status, reviewed_by = admin_row.id, reviewed_at = now()
      where id = req.source_id;
    if p_new_status = 'approved' then
      select a.* into acct from accounts a join deposits d on d.account_id = a.id where d.id = req.source_id;
      update accounts set balance = balance + (select amount from deposits where id = req.source_id)
        where id = acct.id;
    end if;
  elsif req.source_table = 'withdrawals' and req.source_id is not null then
    update withdrawals set status = p_new_status where id = req.source_id;
  elsif req.source_table = 'loans' and req.source_id is not null then
    update loans set status = p_new_status where id = req.source_id;
  end if;

  notif_title := case
    when p_new_status = 'approved' then 'Request Approved'
    else 'Request Rejected'
  end;
  notif_body := case
    when p_new_status = 'approved' then 'Your ' || replace(req.request_type::text, '_', ' ') || ' request has been approved.'
    else 'Your ' || replace(req.request_type::text, '_', ' ') || ' request was rejected.' ||
         coalesce(' Reason: ' || p_admin_message, '')
  end;

  insert into notifications (customer_id, title, body)
  values (req.customer_id, notif_title, notif_body);

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
grant execute on function admin_review_service_request to authenticated; -- is_admin() check happens inside the function

-- =========================================================
-- Row Level Security
-- =========================================================
alter table admin_users enable row level security;
alter table service_requests enable row level security;
alter table admin_activity_logs enable row level security;

-- admin_users: an admin can read their own row (used at login
-- to resolve role). No self-service insert/update — rows are
-- created manually per your instructions.
create policy "admin_users_select_own" on admin_users
  for select using (auth.uid() = auth_user_id);

-- service_requests: customers manage their own; admins see/update all.
create policy "service_requests_select_own" on service_requests
  for select using (customer_id in (select id from customers where auth_user_id = auth.uid()));
create policy "service_requests_insert_own" on service_requests
  for insert with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

create policy "service_requests_admin_select_all" on service_requests
  for select using (is_admin());
create policy "service_requests_admin_update_all" on service_requests
  for update using (is_admin());

-- admin_activity_logs: admins can read the audit trail (all of
-- it — it's a shared operational log, not per-admin data).
-- No insert/update/delete policy for anyone — writes only ever
-- happen inside SECURITY DEFINER RPCs, which bypass RLS.
create policy "admin_activity_logs_admin_select_all" on admin_activity_logs
  for select using (is_admin());

-- ---------------------------------------------------------
-- Additive admin read policies on existing tables.
-- These are new policies alongside the existing customer-scoped
-- ones from 0001 — nothing existing is dropped or changed.
-- ---------------------------------------------------------
create policy "admins_select_all_customers" on customers
  for select using (is_admin());

create policy "admins_select_all_accounts" on accounts
  for select using (is_admin());

create policy "admins_select_all_transactions" on transactions
  for select using (is_admin());

create policy "admins_select_all_deposits" on deposits
  for select using (is_admin());

create policy "admins_select_all_withdrawals" on withdrawals
  for select using (is_admin());

create policy "admins_select_all_loans" on loans
  for select using (is_admin());

create policy "admins_select_all_notifications" on notifications
  for select using (is_admin());

-- =========================================================
-- Admin creation (manual, one-time — no public admin signup)
-- =========================================================
-- 1. Create the auth user first, e.g. via Supabase Dashboard →
--    Authentication → Add User (or supabase.auth.admin.createUser
--    from a trusted server-side script). Copy the resulting UUID.
--
-- 2. Then run:
--
--    insert into admin_users (auth_user_id, name, email)
--    values ('<paste-auth-user-uuid>', 'Admin Name', 'admin@rzebank.com');
--
-- That's the only way an admin_users row is ever created —
-- there is no API route or UI form that inserts into this table.
