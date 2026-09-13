import { MailCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata = { title: "Verify Your Email — RZE Bank" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500">
          <MailCheck className="h-7 w-7 text-white" />
        </div>
        <CardTitle>Check Your Inbox</CardTitle>
        <CardDescription>
          Verification email has been sent to your email address
          {email ? <> (<span className="text-white">{email}</span>)</> : null}. Click the link
          inside to verify it — you&apos;ll then be asked for your name, Aadhaar, PAN and a few
          other details, after which your Customer ID and Account Number are generated
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        Didn&apos;t get the email? Check your spam folder, or head to the{" "}
        <a href="/login" className="text-blue-400 hover:underline">
          login page
        </a>{" "}
        to resend it.
      </CardContent>
    </Card>
  );
}
