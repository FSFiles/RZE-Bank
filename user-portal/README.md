# RZE Bank — Website Recreation

A pixel-close recreation of the RZE Bank marketing site, rebuilt from scratch with a modern, production-ready stack. This is a **full recreation**, not a redesign — every section from the reference site is included, in the same order, with the same content and interactions, plus the three new products requested (see below).

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**-style components (Button, Card, Badge, Accordion, Slider, Tabs, Sheet)
- **Lucide React** icons
- **Framer Motion** animations
- **Recharts** (market chart + EMI breakdown donut)
- **React Hook Form** + **Zod** (wired in and ready for form validation)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm run start
```

> **Note:** `next/font/google` fetches the Inter and Sora fonts at build time, so an internet connection is required for `npm run build` / `npm run dev` the first time.

## What was added (per your request)

1. **Fixed Deposit section** (`components/sections/fixed-deposit-section.tsx`, data in `lib/constants/fixed-deposits.ts`)
   - General Fixed Deposit — 3.2% p.a. (Guaranteed Returns, Flexible Tenure, Safe Investment, Online Opening)
   - Senior Citizen Fixed Deposit — 3.8% p.a. (Higher Interest Rate, Quarterly Interest, Flexible Tenure, Secure Investment)
   - Styled identically to the existing investment/loan cards (same glass card, badge, and rate treatment).

2. **Women Empowerment Loan** — added to `lib/constants/loans.ts` as a new entry in the existing Loan Products grid (`components/sections/loans-section.tsx`), rendered with the exact same card component as every other loan (rate starting from 7.5% p.a., all 7 benefits, "Apply Now" button).

No other section, color, spacing, or component was modified beyond what was requested.

## Project Structure

```
app/                    # Next.js App Router pages, layout, global styles
  layout.tsx
  page.tsx              # Assembles every section in order
  globals.css
  loading.tsx / error.tsx / not-found.tsx
components/
  navbar.tsx
  footer.tsx
  chat-widget.tsx
  section-heading.tsx
  sections/             # One component per page section
  ui/                    # shadcn/ui-style primitives
hooks/                  # useScrolled, useEmiCalculator
lib/
  utils.ts              # cn() helper
  constants/             # All page content/data, typed
public/
styles/
  print.css
types/
  index.ts               # Shared TypeScript interfaces
utils/
  format.ts               # INR formatting + EMI math
```

## Important honesty note

My tools could read this site's text content but not its live/rendered CSS, so exact hex values, pixel spacing, and font files could not be scraped directly. I rebuilt the same layout, section order, copy, and a matching dark-navy fintech look (glassmorphism cards, blue→violet gradients, the same card-mockup hero, live ticker, EMI calculator, etc.) by eye and from the extracted content. If anything doesn't match closely enough once you compare side-by-side (a specific color, spacing value, or animation timing), point it out and I'll tune it precisely.

## Notes

- All data (services, loans, investments, cards, testimonials, FAQ, etc.) lives in `lib/constants/*.ts` — update content there without touching component markup.
- The EMI calculator, market chart, and FD/loan data are fully typed via `types/index.ts`.
- `react-hook-form` + `zod` are installed and ready to wire into the "Open Account" / "Apply Now" flows whenever you're ready to add real forms and backend submission.
