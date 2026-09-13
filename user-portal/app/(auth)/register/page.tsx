import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create Account — RZE Bank" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Your RZE Bank Account</CardTitle>
        <CardDescription>
          Start with your email address — we&apos;ll verify it, then collect your details to
          open the account. It only takes a few minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
