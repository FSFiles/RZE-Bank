"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // This is what used to fail silently and leave the dashboard
    // content area blank (with only the Navbar/Footer showing).
    // Check the terminal running `next dev` for this log.
    console.error("Dashboard failed to load:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">
          We couldn&apos;t load your dashboard
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Something went wrong fetching your account details. This is usually a temporary
          connection issue — try again, and if it keeps happening, check that all Supabase
          migrations have been applied.
        </p>
      </div>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
