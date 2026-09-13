"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(values);
      if (!result.success) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      toast.success(result.message ?? "If that account exists, a reset link has been sent.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        If <span className="text-white">{form.getValues("identifier")}</span> matches an account,
        a password reset link has been sent to its email address.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer ID or Email</FormLabel>
              <FormControl>
                <Input placeholder="RZE-CUST-000001 or you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </Form>
  );
}
