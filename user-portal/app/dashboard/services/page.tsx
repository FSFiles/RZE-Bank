"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Landmark,
  BookOpen,
  CreditCard,
  MapPin,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { addServiceRequest, genServiceRequestId, getServiceRequests } from "@/lib/mock/store";
import type { ServiceRequestType } from "@/lib/mock/types";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SERVICE_META: Record<ServiceRequestType, { label: string; icon: typeof BookOpen; placeholder: string }> = {
  cheque_book: { label: "Cheque Book Request", icon: BookOpen, placeholder: "Number of leaves (e.g. 25)" },
  debit_card: { label: "Debit Card Request", icon: CreditCard, placeholder: "Reason (lost / damaged / new)" },
  address_change: { label: "Address Change Request", icon: MapPin, placeholder: "New address" },
  nominee_update: { label: "Nominee Details", icon: Users, placeholder: "Nominee full name & relationship" },
  kyc_update: { label: "KYC Update", icon: ShieldCheck, placeholder: "Document reference / notes" },
};

export default function ServicesPage() {
  const { loading, account } = useCustomerAccountSession();
  const [openType, setOpenType] = useState<ServiceRequestType | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const requests = getServiceRequests(account.accountNumber);
  const kycRequests = requests.filter((r) => r.type === "kyc_update");
  const kycStatus = kycRequests.length > 0 ? kycRequests[kycRequests.length - 1].status : "not_submitted";

  async function submit(type: ServiceRequestType) {
    if (!details.trim()) {
      toast.error("Please provide the required details.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    addServiceRequest({
      id: genServiceRequestId(),
      accountNumber: account!.accountNumber,
      type,
      details: details.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setDetails("");
    setOpenType(null);
    setSubmitting(false);
    toast.success("Request submitted successfully.");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <DashboardPageHeader icon={Landmark} title="Bank Services" description="Cheque book, cards, address, nominee & KYC" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-[hsl(var(--gold))]" /> KYC Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              kycStatus === "not_submitted" && "border-slate-500/30 bg-slate-500/10 text-slate-300",
              kycStatus === "pending" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
              kycStatus === "processing" && "border-blue-500/30 bg-blue-500/10 text-blue-400",
              kycStatus === "completed" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            )}
          >
            {kycStatus.replace("_", " ")}
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(Object.keys(SERVICE_META) as ServiceRequestType[]).map((type) => {
          const meta = SERVICE_META[type];
          const Icon = meta.icon;
          const isOpen = openType === type;
          const existing = requests.filter((r) => r.type === type);
          return (
            <Card key={type} className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setOpenType(isOpen ? null : type)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--gold))]/10">
                    <Icon className="h-4 w-4 text-[hsl(var(--gold))]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    {existing.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {existing.length} request{existing.length > 1 ? "s" : ""} submitted
                      </p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {isOpen ? "Close" : "Request"}
                </Button>
              </div>
              {isOpen && (
                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <Label htmlFor={`details-${type}`}>{meta.placeholder}</Label>
                  <Input id={`details-${type}`} value={details} onChange={(e) => setDetails(e.target.value)} />
                  <Button onClick={() => submit(type)} disabled={submitting} size="sm">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
