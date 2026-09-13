import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Set New Password — RZE Bank" };

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a New Password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
