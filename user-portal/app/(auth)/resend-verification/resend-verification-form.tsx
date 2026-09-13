"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resendVerificationSchema, type ResendVerificationFormValues } from "@/lib/validations/auth";
import { resendVerificationEmail } from "@/lib/actions/auth";

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

export function ResendVerificationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ResendVerificationFormValues) {
    setSubmitting(true);
    try {
      const result = await resendVerificationEmail(values.email);
      if (!result.success) {
        toast.error(result.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      toast.success(result.message ?? "Verification email resent.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        If <span className="text-white">{form.getValues("email")}</span> has a pending
        registration, a new verification email is on its way.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
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
            "Resend Verification Email"
          )}
        </Button>
      </form>
    </Form>
  );
}
