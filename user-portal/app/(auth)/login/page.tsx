import { Suspense } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log In — RZE Bank" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Log in to access your RZE Bank account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-blue-400 hover:underline">
            Forgot your password?
          </Link>
          <p>
            New to RZE Bank?{" "}
            <Link href="/register" className="text-blue-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
