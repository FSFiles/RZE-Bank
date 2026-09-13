# RZE Bank — Setup Guide (Phase 1: Foundation + Phase 2: Auth & Registration)

This covers everything needed to get the customer registration, email
verification, login, and password-reset flow running against a real
Supabase project. The existing landing-page UI has not been touched —
only new files were added.

## 1. Create your Supabase project

1. Go to https://supabase.com/dashboard and create a new project (pick
   any region close to you, e.g. Singapore for lowest latency from
   Chennai).
2. Once it's provisioned, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret!)

## 2. Configure environment variables

**Frontend** — copy `.env.example` to `.env.local` in `rze-bank/` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 3. Run the database migration

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste the full contents of `supabase/migrations/0001_init.sql` and run it.
   This creates all 7 tables (`customers`, `accounts`, `transactions`,
   `deposits`, `withdrawals`, `loans`, `notifications`, plus a
   `pending_registrations` staging table), the `RZE-CUST-######` /
   `RZE{year}########` ID generators, the trigger that auto-provisions a
   Customer + Account the moment an email is verified, and Row Level
   Security policies so each customer only ever sees their own data.

## 4. Configure Supabase Auth email templates and redirect URLs (required)

Under **Authentication → URL Configuration**, add these to the allow-list
of **Redirect URLs** (this is required — Supabase silently drops
`emailRedirectTo`/`redirectTo` values that aren't allow-listed, which is
the single most common reason a "confirm your email" link doesn't take
the user anywhere useful):

```
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
```

...and the equivalent for your production URL once you have one. Easiest
is to use a wildcard so you never have to revisit this list again:

```
http://localhost:3000/**
https://your-production-domain.com/**
```

Two routes are involved and both need to be allow-listed:
- **`/auth/confirm`** — handles the "Confirm signup" and "Reset password"
  email links. It's a client-side page (not a server route) on purpose:
  Supabase's hosted verification link delivers the session as a URL
  **hash fragment** (`#access_token=...`), which only client-side
  JavaScript can ever read — a server Route Handler never sees it,
  since fragments aren't sent in the HTTP request at all. This page also
  transparently handles the `token_hash`/`type` and PKCE `code` shapes,
  so it works regardless of how your project's Auth settings are
  configured.
- **`/auth/callback`** — handles the Google OAuth sign-in redirect only
  (that flow provides a proper PKCE `code`, so a server route works
  fine there).

You don't need to touch the "Confirm signup" or "Reset password" email
templates themselves — the default `{{ .ConfirmationURL }}` /
`{{ .SiteURL }}...` templates work as-is; only the redirect allow-list
above matters.

## 5. Install & run

```bash
cd rze-bank
npm install
npm run dev
```

Visit http://localhost:3000/register to test the full flow:
1. Enter your email + password → an auth user is created (unverified)
   and a confirmation email is sent.
2. Check your inbox, click the verification link. You land on
   `/auth/confirm`, which establishes your session, then sends you to
   `/complete-profile`.
3. Fill in your name, DOB, Aadhaar, PAN, address, and account type.
   Submitting calls the `provision_customer` RPC, which creates your
   `customers` and `accounts` rows with a generated Customer ID and
   Account Number — shown to you right there before you're dropped
   into `/dashboard`.
4. `/dashboard` shows your live Customer ID, Account Number, type, and
   balance — proving the whole pipeline works.

## 6. (Optional) Run the Flask backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --break-system-packages   # or omit the flag outside this sandbox
python run.py
```

`GET /health` confirms it's alive. `GET /api/customer/me` (with
`Authorization: Bearer <supabase-access-token>`) returns the caller's
customer + account profile — this is the foundation later phases
(deposits, withdrawals, transfers, loans) will build on.

## What's included in this phase

- Full DB schema + RLS + auto-provisioning trigger (`supabase/migrations/0001_init.sql`)
- Supabase client setup for Next.js (browser, server, middleware)
- Route protection middleware (`/dashboard` requires auth)
- Zod validation for Aadhaar, PAN, Indian mobile numbers, PIN codes, password strength
- Registration form (all fields from the spec) wired to a server action
- Email verification confirmation page + resend-verification flow
- Login with "please verify your email" handling
- Forgot password / reset password flow
- Flask backend skeleton (OOP models, repositories, services, JWT-protected routes)
- A minimal protected dashboard proving the whole pipeline works end-to-end

## What's next (Phase 3+)

- Full dashboard UI wired to real data (recent transactions, notifications, quick actions)
- Deposit / Withdraw (QR code) / Transfer
- Transaction history with geolocation, search/sort/filter/pagination
- Mini statement PDF generation
- Loan application module
- Profile & Settings pages
