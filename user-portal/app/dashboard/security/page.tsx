"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  History,
  MonitorSmartphone,
} from "lucide-react";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import {
  hasTransactionPin,
  setTransactionPin,
  verifyTransactionPin,
  updateCustomer,
  getSecuritySettings,
  saveSecuritySettings,
  getDeviceSessions,
  notify,
} from "@/lib/mock/store";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { PinInput } from "@/components/dashboard/pin-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SecurityCenterPage() {
  const { loading, customer, refresh } = useCustomerAccountSession();

  // PIN state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  // password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [security, setSecurity] = useState(() =>
    typeof window !== "undefined" ? getSecuritySettings() : null
  );

  if (loading || !customer || !security) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const pinExists = hasTransactionPin(customer.customerId);
  const devices = getDeviceSessions();

  async function handlePinSave(e: React.FormEvent) {
    e.preventDefault();
    if (pinExists && !verifyTransactionPin(customer!.customerId, currentPin)) {
      toast.error("Current PIN is incorrect.");
      return;
    }
    if (newPin.length !== 4) {
      toast.error("New PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("New PINs do not match.");
      return;
    }
    setPinBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    setTransactionPin(customer!.customerId, newPin);
    notify("Security Alert", "Your transaction PIN was changed successfully.", "security");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinBusy(false);
    toast.success(pinExists ? "Transaction PIN updated." : "Transaction PIN created.");
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (currentPassword !== customer!.password) {
      toast.error("Current password is incorrect.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    updateCustomer(customer!.customerId, { password: newPassword });
    notify("Security Alert", "Your password was changed successfully.", "security");
    refresh();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordBusy(false);
    toast.success("Password updated.");
  }

  function toggleTwoFactor(checked: boolean) {
    const next = { ...security!, twoFactorEnabled: checked };
    setSecurity(next);
    saveSecuritySettings(next);
    updateCustomer(customer!.customerId, { twoFactorEnabled: checked });
    notify(
      "Security Alert",
      `Two-Factor Authentication was ${checked ? "enabled" : "disabled"}.`,
      "security"
    );
    toast.success(`Two-Factor Authentication ${checked ? "enabled" : "disabled"}.`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DashboardPageHeader
        icon={ShieldCheck}
        title="Security Center"
        description="Manage your PIN, password, and account protection"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-[hsl(var(--gold))]" /> Transaction PIN
          </CardTitle>
          <CardDescription>
            {pinExists
              ? "Change your 4-digit transaction PIN used to authorize transfers and reveal your balance."
              : "You haven't created a transaction PIN yet — set one below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePinSave} className="space-y-5">
            {pinExists && (
              <div className="space-y-2">
                <Label className="text-xs">Current PIN</Label>
                <PinInput value={currentPin} onChange={setCurrentPin} />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs">New PIN</Label>
              <PinInput value={newPin} onChange={setNewPin} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Confirm New PIN</Label>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <Button type="submit" disabled={pinBusy} className="w-full sm:w-auto">
              {pinBusy ? "Saving..." : pinExists ? "Update PIN" : "Create PIN"}
            </Button>
            {pinExists && (
              <p className="text-xs text-muted-foreground">
                Forgot your PIN? Verifying your current password above resets it — just enter your
                account password instead of the old PIN if you can&apos;t recall it, or contact
                support from the Help Center.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-[hsl(var(--gold))]" /> Change Password
          </CardTitle>
          <CardDescription>Update your account login password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
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
            <Button type="submit" disabled={passwordBusy}>
              {passwordBusy ? "Saving..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4 text-[hsl(var(--gold))]" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>Require an OTP in addition to your password at login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm font-medium">
                {security.twoFactorEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You&apos;ll receive an OTP on your registered mobile number
              </p>
            </div>
            <Checkbox checked={security.twoFactorEnabled} onCheckedChange={(v) => toggleTwoFactor(Boolean(v))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-[hsl(var(--gold))]" /> Last Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {customer.lastLoginAt
              ? new Date(customer.lastLoginAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "This is your first login."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MonitorSmartphone className="h-4 w-4 text-[hsl(var(--gold))]" /> Active Sessions &amp; Device History
          </CardTitle>
          <CardDescription>Devices that have recently accessed your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {devices.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {d.device}
                  {d.current && (
                    <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.location}</p>
              </div>
              <p className="text-xs text-muted-foreground">{d.lastActive}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
