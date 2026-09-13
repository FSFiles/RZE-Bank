"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { loginCustomer } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { customerId: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    setNeedsVerification(false);
    try {
      const result = await loginCustomer(values);
      if (!result.success) {
        if (result.error === "Please verify your email before logging in.") {
          setNeedsVerification(true);
        }
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Welcome back!");
      router.replace(searchParams.get("redirectTo") ?? "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleAuthButton label="Log in with Google" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="RZE-CUST-000001"
                    className="uppercase"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {needsVerification && (
            <p className="text-sm text-muted-foreground">
              Haven&apos;t verified your email yet?{" "}
              <Link href="/resend-verification" className="text-blue-400 hover:underline">
                Resend verification email
              </Link>
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
