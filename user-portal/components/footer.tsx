import Link from "next/link";
import { Landmark, MapPin, Phone, Mail, Clock } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Personal Banking",
    links: ["Savings Account", "Current Account", "Fixed Deposits", "Salary Account", "Student Banking"],
  },
  {
    title: "Loans",
    links: ["Personal Loan", "Home Loan", "Education Loan", "Business Loan", "Car Loan"],
  },
  {
    title: "Investments",
    links: ["Mutual Funds", "Fixed Deposits", "Digital Gold", "Stocks", "Retirement Plans"],
  },
  {
    title: "Support",
    links: ["Help Center", "Branch Locator", "ATM Locator", "Customer Care", "Grievance Redressal"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Investor Relations", "Press & Media", "Blog"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security", "MITC"],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 pt-16">
      <div className="container">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_repeat(6,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
                <Landmark className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-lg font-bold text-white">RZE Bank</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Secure. Smart. Simple. — India&apos;s most trusted digital banking platform for
              personal and business banking.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Branch Locator · ATM Locator
              </span>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-slate-400 transition-colors hover:text-blue-300"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 border-t border-white/10 py-8 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Phone className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-white">1800-102-4242 (Toll Free)</p>
              <p className="text-xs text-slate-500">Mon–Sat, 9AM–9PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Mail className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-white">support@rzebank.in</p>
              <p className="text-xs text-slate-500">Response within 4 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Clock className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-white">RZE Financial Tower, BKC, Mumbai 400051</p>
              <p className="text-xs text-slate-500">Corporate Headquarters</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 RZE Financial Services Pvt. Ltd. All rights reserved. CIN:
            U65191MH2019PTC000001. RBI Registration No: NBFC-ABC-2019-001.
          </p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Cookies", "Security", "Careers"].map((l) => (
              <Link key={l} href="#" className="hover:text-blue-300">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <p className="border-t border-white/10 py-6 text-center text-[11px] text-slate-600">
          Deposits insured up to ₹5,00,000 by DICGC | Member of NPCI | SEBI Registered IA:
          INA000012345
        </p>
      </div>
    </footer>
  );
}
