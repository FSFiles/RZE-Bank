import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResendVerificationForm } from "./resend-verification-form";

export const metadata = { title: "Resend Verification Email — RZE Bank" };

export default function ResendVerificationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resend Verification Email</CardTitle>
        <CardDescription>
          Haven&apos;t received your verification email, or it expired? Enter the email you
          registered with and we&apos;ll send a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResendVerificationForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in with your Customer ID
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
