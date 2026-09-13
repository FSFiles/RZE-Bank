# RZE Bank — User Portal + Admin Portal (separate hosting)

This project is now split into **two independent Next.js apps** that share one
Supabase backend/database but are built, deployed, and hosted separately.

```
user-portal/    ← the customer-facing site (marketing pages + /dashboard)
admin-portal/   ← the staff-only admin console (was /admin/* — now its own app)
database/       ← Supabase SQL migrations, shared by both apps
```

Deploy each folder as its **own project** (e.g. two separate Vercel projects,
or two separate servers) on two separate domains/subdomains, for example:

- `user-portal` → `https://rzebank.com`
- `admin-portal` → `https://admin.rzebank.com`

They never call each other directly — both just talk to the same Supabase
project via `NEXT_PUBLIC_SUPABASE_URL` / keys, so data created in one
(e.g. a deposit request submitted by a customer) shows up instantly in the
other (the admin's Deposits queue).

---

## 1. Database — run this first, once

Both apps depend on the same Supabase project. In the Supabase SQL editor,
run every file in `database/migrations/` **in order** (0001 → 0007). If
you already ran 0001–0006 for the original project, you only need to run
the new one:

```
database/migrations/0007_deposit_loan_admin_review.sql
```

This adds:
- `loans.cibil_score`, `loan_category`, `reviewed_by/at`, `rejection_reason`
- `deposits.rejection_reason`
- Admin-only RPCs used by the new Admin Portal pages: `admin_approve_deposit`,
  `admin_reject_deposit`, `admin_set_loan_cibil_score`, `admin_approve_loan`,
  `admin_reject_loan`

You still need at least one row in `admin_users` to log into the Admin
Portal — see the note at the bottom of
`database/migrations/0004_admin_and_service_requests.sql` for how to create
one (create the Supabase Auth user first, then insert the `admin_users` row
with that user's UUID).

## 2. User Portal (`user-portal/`)

```bash
cd user-portal
cp .env.example .env.local   # fill in your Supabase URL/keys
npm install
npm run dev                  # http://localhost:3000
```

What it has: the marketing site, signup/login, and the full customer
`/dashboard` — deposits, withdrawals, transfers, **loan applications**
(now backed by real Supabase — this used to be a mock/demo flow), cards,
statements, etc.

## 3. Admin Portal (`admin-portal/`)

```bash
cd admin-portal
cp .env.example .env.local   # same Supabase project, different keys/site URL
npm install
npm run dev                  # http://localhost:3001 (pick any free port)
```

Everything that used to live at `/admin/*` inside the old single app now
lives at the **root** of this app (it's its own site):

| Old path              | New path (this app) |
|------------------------|----------------------|
| `/admin/login`         | `/login`             |
| `/admin/dashboard`     | `/dashboard`         |
| `/admin/customers`     | `/customers`         |
| `/admin/requests`      | `/requests`          |
| `/admin/transactions`  | `/transactions`      |
| `/admin/analytics`     | `/analytics`         |
| — (new) —              | `/deposits`          |
| — (new) —              | `/loans`             |

### New: Deposits page (`/deposits`)
Every deposit a customer submits shows up here with full details — customer
name & ID, account number & current balance, amount, method, reference
number, receipt link — with **Approve** / **Reject** buttons. Approving
credits the customer's account immediately and notifies them; rejecting
asks for a reason, which is shown to the customer.

### New: Loans page (`/loans`)
Every loan application shows up here with full applicant details (income,
occupation, purpose, uploaded documents). The admin types the customer's
**CIBIL score** directly into the row and saves it — independent of
approving/rejecting, so it can be recorded while the application is still
under review. **Approve is disabled until a score has been entered.**
Rejecting asks for a reason, shown to the customer.

Both pages sit alongside the original unified "All Requests" queue
(`/requests`), which still works exactly as before — the new pages just
give deposits and loans their own focused, detail-rich view instead of a
generic one.

## 4. Environment variables

Both `.env.example` files list what's needed. In short, both apps need:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server-only, never expose to the browser
NEXT_PUBLIC_SITE_URL=...           # this app's own deployed URL
```

Use the **same Supabase project** for both — that's what makes "separate
hosting, same data" work.

## What changed vs. the version you uploaded

1. Split one Next.js app into two standalone apps (`user-portal`,
   `admin-portal`) — separate `package.json`, config, and hosting.
2. The Loans application flow was previously mock/demo data (local
   `lib/mock/store.ts`) — it's now wired to the real `loans` table and the
   admin review queue, the same way Deposits already was.
3. Added a dedicated **Deposits** admin page (approve/reject with full
   detail) and a dedicated **Loans** admin page (CIBIL score entry +
   approve/reject), per your request — see `database/migrations/0007_*.sql`
   for the backing schema/RPCs and `admin-portal/components/admin/
   deposit-request-table.tsx` / `loan-request-table.tsx` for the UI.
