import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AdminLoginForm } from "./admin-login-form";

export const metadata = { title: "Admin Login — RZE Bank" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070B1A] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30">
            <ShieldCheck className="h-6 w-6 text-[hsl(var(--gold))]" />
          </span>
          <p className="font-display text-lg font-semibold text-white">RZE Bank</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Portal</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Staff Sign In</CardTitle>
            <CardDescription>Restricted access — authorized bank staff only.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <AdminLoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
