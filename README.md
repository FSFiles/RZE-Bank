# RZE Bank — User Portal + Admin Portal

RZE Bank is a digital banking application split into **two independent Next.js
apps** that share one Supabase backend/database but are built, deployed, and
hosted separately.

## 🌐 Live Applications

| Application | Live URL |
|------------|----------|
| **Customer / User Portal** | https://rzebankuser-portal.vercel.app/ |
| **Admin Portal** | https://rzebankadmin-portal.vercel.app/login |

### Customer Portal
https://rzebankuser-portal.vercel.app/

The customer-facing application provides:

- Banking landing and marketing pages
- Customer registration and login
- Customer dashboard
- Deposits
- Withdrawals
- Transfers
- Loan applications
- Cards
- Statements
- Account information
- Real-time data through Supabase

### Admin Portal
https://rzebankadmin-portal.vercel.app/login

The staff-only administration application provides:

- Admin authentication
- Dashboard
- Customer management
- Service requests
- Transactions
- Analytics
- Deposit review and approval/rejection
- Loan review and approval/rejection
- CIBIL score management

---

## 🏗️ Project Structure

```text
user-portal/       ← Customer-facing banking application
admin-portal/      ← Staff-only administration console
database/          ← Shared Supabase SQL migrations
