"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { adminLoginSchema, type AdminLoginFormValues } from "@/lib/validations/admin";
import { createClient } from "@/lib/supabase/client";

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

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: AdminLoginFormValues) {
    setSubmitting(true);
    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError || !authData.user) {
        toast.error("Invalid email or password.");
        form.setError("password", { message: "Invalid credentials" });
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        toast.error("This account is not authorized for admin access.");
        return;
      }

      toast.success("Welcome back.");
      router.replace(searchParams.get("redirectTo") ?? "/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
                <Input type="email" placeholder="admin@rzebank.com" {...field} />
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
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Admin accounts are provisioned manually by RZE Bank IT. Contact your administrator if
          you need access.
        </p>
      </form>
    </Form>
  );
}
