-- =========================================================
-- RZE Bank — Core schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Enums
-- ---------------------------------------------------------
do $$ begin
  create type account_type as enum ('savings', 'current');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active', 'frozen', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_type as enum ('male', 'female', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_type as enum ('deposit', 'withdrawal', 'transfer_in', 'transfer_out');
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_status as enum ('pending', 'success', 'failed', 'reversed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending', 'approved', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type loan_type as enum ('personal', 'home', 'vehicle', 'education', 'business');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------
-- Sequences that back the human-readable IDs
-- ---------------------------------------------------------
create sequence if not exists customer_id_seq start 1;
create sequence if not exists account_number_seq start 1;

create or replace function next_customer_id() returns text as $$
  select 'RZE-CUST-' || lpad(nextval('customer_id_seq')::text, 6, '0');
$$ language sql;

create or replace function next_account_number() returns text as $$
  select 'RZE' || to_char(now(), 'YYYY') || lpad(nextval('account_number_seq')::text, 8, '0');
$$ language sql;

-- ---------------------------------------------------------
-- customers
-- One row per verified banking customer. Linked 1:1 to a
-- Supabase Auth user via auth_user_id.
-- ---------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  customer_id text unique not null,
  first_name text not null,
  last_name text not null,
  phone_number text unique not null,
  email text unique not null,
  dob date not null,
  gender gender_type not null,
  aadhaar_number text not null,
  pan_number text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pin_code text not null,
  country text not null default 'India',
  profile_picture_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_email on customers (email);
create index if not exists idx_customers_phone on customers (phone_number);

-- ---------------------------------------------------------
-- pending_registrations
-- Holds KYC form data collected at signup time, before the
-- email is verified. Consumed by the trigger below and then
-- deleted.
-- ---------------------------------------------------------
create table if not exists pending_registrations (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone_number text not null,
  dob date not null,
  gender gender_type not null,
  aadhaar_number text not null,
  pan_number text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pin_code text not null,
  country text not null default 'India',
  account_type account_type not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- accounts
-- ---------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  account_number text unique not null,
  customer_id uuid not null references customers(id) on delete cascade,
  account_type account_type not null,
  ifsc text not null default 'RZEB0001001',
  balance numeric(14,2) not null default 0.00,
  status account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_customer on accounts (customer_id);

-- ---------------------------------------------------------
-- transactions
-- ---------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  counterparty_account_id uuid references accounts(id),
  type txn_type not null,
  amount numeric(14,2) not null check (amount > 0),
  status txn_status not null default 'pending',
  reference_note text,
  latitude double precision,
  longitude double precision,
  city text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_account on transactions (account_id, created_at desc);

-- ---------------------------------------------------------
-- deposits (customer-submitted, admin-approved before credit)
-- ---------------------------------------------------------
create table if not exists deposits (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  method text not null,
  reference_number text not null,
  receipt_url text,
  status request_status not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- withdrawals (QR-code, ATM based)
-- ---------------------------------------------------------
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  withdrawal_id text unique not null,
  account_id uuid not null references accounts(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  qr_payload text not null,
  status request_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- loans
-- ---------------------------------------------------------
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  loan_type loan_type not null,
  amount numeric(14,2) not null check (amount > 0),
  monthly_income numeric(14,2) not null,
  occupation text not null,
  purpose text not null,
  document_urls text[] default '{}',
  status request_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- notifications
-- ---------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Trigger: when a Supabase Auth user verifies their email,
-- consume the pending_registrations row and provision the
-- customer + account records.
-- =========================================================
create or replace function handle_email_verified() returns trigger as $$
declare
  pending pending_registrations%rowtype;
  new_customer_id uuid;
  gen_customer_code text;
  gen_account_number text;
begin
  -- only fire the moment email_confirmed_at transitions from null -> not null
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

-- =========================================================
-- Row Level Security
-- =========================================================
alter table customers enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table deposits enable row level security;
alter table withdrawals enable row level security;
alter table loans enable row level security;
alter table notifications enable row level security;
alter table pending_registrations enable row level security;

-- customers: a user can only see/update their own row
create policy "customers_select_own" on customers
  for select using (auth.uid() = auth_user_id);
create policy "customers_update_own" on customers
  for update using (auth.uid() = auth_user_id);

-- pending_registrations: user can insert/select their own pending row
create policy "pending_insert_own" on pending_registrations
  for insert with check (auth.uid() = auth_user_id);
create policy "pending_select_own" on pending_registrations
  for select using (auth.uid() = auth_user_id);

-- accounts: visible to the owning customer
create policy "accounts_select_own" on accounts
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );

-- transactions: visible to the owning account holder
create policy "transactions_select_own" on transactions
  for select using (
    account_id in (
      select a.id from accounts a
      join customers c on c.id = a.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

-- deposits
create policy "deposits_select_own" on deposits
  for select using (
    account_id in (select a.id from accounts a join customers c on c.id = a.customer_id where c.auth_user_id = auth.uid())
  );
create policy "deposits_insert_own" on deposits
  for insert with check (
    account_id in (select a.id from accounts a join customers c on c.id = a.customer_id where c.auth_user_id = auth.uid())
  );

-- withdrawals
create policy "withdrawals_select_own" on withdrawals
  for select using (
    account_id in (select a.id from accounts a join customers c on c.id = a.customer_id where c.auth_user_id = auth.uid())
  );
create policy "withdrawals_insert_own" on withdrawals
  for insert with check (
    account_id in (select a.id from accounts a join customers c on c.id = a.customer_id where c.auth_user_id = auth.uid())
  );

-- loans
create policy "loans_select_own" on loans
  for select using (customer_id in (select id from customers where auth_user_id = auth.uid()));
create policy "loans_insert_own" on loans
  for insert with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

-- notifications
create policy "notifications_select_own" on notifications
  for select using (customer_id in (select id from customers where auth_user_id = auth.uid()));
create policy "notifications_update_own" on notifications
  for update using (customer_id in (select id from customers where auth_user_id = auth.uid()));
