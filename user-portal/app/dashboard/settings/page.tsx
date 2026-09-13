"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Bell, ShieldCheck, LifeBuoy, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/mock/store";
import type { NotificationSettings } from "@/lib/mock/types";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
      <div>
        <Label className="font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </div>
  );
}

export default function SettingsPage() {
  const { loading, customer } = useCustomerAccountSession();
  const [notif, setNotif] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (customer) {
      setNotif(getNotificationSettings());
    }
  }, [customer]);

  if (loading || !customer || !notif) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  function updateNotif(patch: Partial<NotificationSettings>) {
    const next = { ...notif!, ...patch };
    setNotif(next);
    saveNotificationSettings(next);
    toast.success("Notification settings updated.");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <DashboardPageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your notification preferences and account tools"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[hsl(var(--gold))]" /> Notification Settings
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Transaction Alerts"
            description="Get notified for deposits, withdrawals, and transfers"
            checked={notif.transactionAlerts}
            onChange={(v) => updateNotif({ transactionAlerts: v })}
          />
          <ToggleRow
            label="Loan Updates"
            description="Status updates on your loan applications"
            checked={notif.loanUpdates}
            onChange={(v) => updateNotif({ loanUpdates: v })}
          />
          <ToggleRow
            label="Promotional Offers"
            description="Offers on cards, FDs, and investment products"
            checked={notif.promotionalOffers}
            onChange={(v) => updateNotif({ promotionalOffers: v })}
          />
          <ToggleRow
            label="Email Notifications"
            description="Receive notifications via email"
            checked={notif.emailNotifications}
            onChange={(v) => updateNotif({ emailNotifications: v })}
          />
          <ToggleRow
            label="SMS Notifications"
            description="Receive notifications via SMS"
            checked={notif.smsNotifications}
            onChange={(v) => updateNotif({ smsNotifications: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[hsl(var(--gold))]" /> Security
          </CardTitle>
          <CardDescription>PIN, password, 2FA, and device history now live in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/security">
            <Button variant="outline" className="w-full">
              Open Security Center
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[hsl(var(--gold))]" /> Bank Services
          </CardTitle>
          <CardDescription>Cheque book, debit card, address change, nominee, KYC</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/services">
            <Button variant="outline" className="w-full">
              Open Bank Services
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-[hsl(var(--gold))]" /> Help &amp; Support
          </CardTitle>
          <CardDescription>FAQs, live chat, and complaint tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/help">
            <Button variant="outline" className="w-full">
              Open Help Center
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
