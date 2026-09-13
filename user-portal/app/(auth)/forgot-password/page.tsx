import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot Password — RZE Bank" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your Customer ID or email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
