import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl text-blue-400">
        <Compass className="h-8 w-8" />
      </div>
      <div>
        <h1 className="font-display text-4xl font-bold gradient-text">404</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This page has wandered off. Let&apos;s get you back to safe banking ground.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
