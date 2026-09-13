"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, BadgeCheck, Landmark } from "lucide-react";
import { toast } from "sonner";

import { completeProfileSchema, type CompleteProfileFormValues } from "@/lib/validations/auth";
import { completeCustomerProfile } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

const GENERATING_STEPS = [
  "Verifying your details...",
  "Generating your Customer ID...",
  "Opening your bank account...",
  "Finalizing your profile...",
];

type Phase = "form" | "generating" | "done";

export function CompleteProfileForm({
  defaultFirstName,
  defaultLastName,
  email,
}: {
  defaultFirstName: string;
  defaultLastName: string;
  email: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<{ customerId: string; accountNumber: string } | null>(
    null
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const form = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      dob: "",
      mobileNumber: "",
      aadhaarNumber: "",
      panNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
    },
  });

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  async function onSubmit(values: CompleteProfileFormValues) {
    setPhase("generating");
    setStepIndex(0);

    // Advance the status text every ~900ms purely for visual feedback
    // while the real request runs in the background.
    GENERATING_STEPS.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(setTimeout(() => setStepIndex(i), i * 900));
    });

    const minAnimationTime = new Promise((resolve) =>
      setTimeout(resolve, GENERATING_STEPS.length * 900)
    );

    const [actionResult] = await Promise.all([completeCustomerProfile(values), minAnimationTime]);

    timers.current.forEach(clearTimeout);

    if (!actionResult.success) {
      if (actionResult.fieldErrors) {
        Object.entries(actionResult.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof CompleteProfileFormValues, { message });
        });
      }
      toast.error(actionResult.error || "Something went wrong. Please try again.");
      setPhase("form");
      return;
    }

    setResult({ customerId: actionResult.customerId, accountNumber: actionResult.accountNumber });
    setPhase("done");

    timers.current.push(
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 4500)
    );
  }

  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500/20" />
          <Landmark className="relative h-9 w-9 text-blue-400" />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium"
          >
            {GENERATING_STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {GENERATING_STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-blue-500" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 12 }}
        >
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-semibold">Your account is ready!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to RZE Bank. Redirecting you to your dashboard...
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3 rounded-xl border bg-card/50 p-5">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4" /> Customer ID
            </span>
            <span className="font-mono text-sm font-medium">{result.customerId}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="h-4 w-4" /> Account Number
            </span>
            <span className="font-mono text-sm font-medium">{result.accountNumber}</span>
          </motion.div>
        </div>

        <Button asChild size="lg" className="w-full max-w-sm">
          <Link href="/dashboard">Go to Dashboard Now</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h3 className="section-eyebrow w-fit">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Leon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Kumar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="section-eyebrow w-fit">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" maxLength={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input value={email} disabled />
              </FormControl>
            </FormItem>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="section-eyebrow w-fit">Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="aadhaarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl>
                    <Input placeholder="123412341234" maxLength={12} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="uppercase"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="section-eyebrow w-fit">Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Flat / House No, Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Landmark, Area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Chennai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input placeholder="600001" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="section-eyebrow w-fit">Account</h3>
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-3">
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="leading-tight">
                  <FormLabel className="font-normal">I accept the Terms & Conditions</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptPrivacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="leading-tight">
                  <FormLabel className="font-normal">I accept the Privacy Policy</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" size="lg" className="w-full">
          Open My Account
        </Button>
      </form>
    </Form>
  );
}
