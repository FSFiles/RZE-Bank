"use client";

import { useState, useEffect, useRef } from "react";
import { UserCog, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { updateCustomer, notify } from "@/lib/mock/store";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { loading, customer, refresh } = useCustomerAccountSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setEmail(customer.email);
      setMobileNumber(customer.mobileNumber);
      setAddressLine1(customer.addressLine1);
      setCity(customer.city);
      setState(customer.state);
      setPinCode(customer.pinCode);
    }
  }, [customer]);

  if (loading || !customer) return <p className="text-sm text-muted-foreground">Loading...</p>;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please upload a JPG or PNG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateCustomer(customer!.customerId, { photoDataUrl: reader.result as string });
      refresh();
      toast.success("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !city.trim() || !email.trim() || !mobileNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    updateCustomer(customer!.customerId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      addressLine1: addressLine1.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      ...(newPassword ? { password: newPassword } : {}),
    });
    notify("Profile Updated", "Your profile details were updated successfully.", "general");
    refresh();
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
    toast.success("Profile updated successfully.");
  }

  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader icon={UserCog} title="Profile" description="Manage your personal details and password" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {customer.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customer.photoDataUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--gold))]/15 text-lg font-semibold text-[hsl(var(--gold))]">
              {initials}
            </span>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--gold))] text-[#0B1F4D]"
            aria-label="Change photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="font-medium">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-xs font-mono text-muted-foreground">{customer.customerId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Keep your details up to date</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Phone Number</Label>
                <Input
                  id="mobileNumber"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input id="pinCode" value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
