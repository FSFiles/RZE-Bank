"use client";

import { AlertTriangle, Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALERTS = [
  "Never share your OTP, PIN, or password with anyone — not even bank employees.",
  "Beware of fake calls claiming to be from RZE Bank. We never ask for OTP over phone.",
  "Avoid clicking suspicious links in SMS or emails claiming to be from your bank.",
  "Always verify the website URL before entering your banking credentials.",
];

export function FraudAlertSection() {
  return (
    <section className="relative py-16">
      <div className="container">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Fraud Awareness Alert
                </h3>
                <p className="text-sm text-slate-400">Stay safe from cyber fraud</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl glass px-5 py-3">
              <Phone className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-[11px] text-slate-500">Official Helpline</p>
                <p className="font-display text-sm font-bold text-white">1800-102-4242</p>
                <p className="text-[10px] text-slate-500">Toll Free · 24×7</p>
              </div>
              <Button variant="secondary" size="sm" className="ml-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                Report Scam
              </Button>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {ALERTS.map((alert) => (
              <li key={alert} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
