"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, BadgeCheck, Landmark } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export function WelcomeReveal({
  firstName,
  customerId,
  accountNumber,
}: {
  firstName: string;
  customerId: string;
  accountNumber: string;
}) {

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-lg flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 12 }}
          >
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {firstName}!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your email is verified and your RZE Bank account is ready.
            </p>
          </div>

          <div className="w-full space-y-3 rounded-xl border bg-card/50 p-5">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="h-4 w-4" /> Customer ID
              </span>
              <span className="font-mono text-sm font-medium">{customerId}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Landmark className="h-4 w-4" /> Account Number
              </span>
              <span className="font-mono text-sm font-medium">{accountNumber}</span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="text-xs text-muted-foreground"
          >
            Use your Customer ID to log in from now on — keep it somewhere safe.
          </motion.p>

          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
