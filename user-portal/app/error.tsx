"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We hit an unexpected error loading this page. Please try again, or come back in a
          moment.
        </p>
      </div>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
