"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Landmark,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Home,
  Briefcase,
  HeartHandshake,
  User,
  Upload,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { createLoanRequest, getMyLoanApplications, type LoanApplicationRow } from "@/lib/actions/banking";
import type { LoanType } from "@/lib/mock/types";
import { formatINR } from "@/utils/format";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOAN_TYPES: { type: LoanType; icon: typeof User; description: string }[] = [
  { type: "Personal Loan", icon: User, description: "For any personal need, quick approval" },
  { type: "Home Loan", icon: Home, description: "Buy, build, or renovate your home" },
  { type: "Education Loan", icon: GraduationCap, description: "Fund higher studies in India or abroad" },
  { type: "Women Empowerment Loan", icon: HeartHandshake, description: "Special rates for women entrepreneurs" },
  { type: "Business Loan", icon: Briefcase, description: "Grow your business with working capital" },
];

export default function LoansPage() {
  const { loading, customer, account } = useCustomerAccountSession();
  const [selected, setSelected] = useState<LoanType | null>(null);
  const [fullName, setFullName] = useState("");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("12");
  const [purpose, setPurpose] = useState("");
  const [assets, setAssets] = useState("");
  const [income, setIncome] = useState("");
  const [occupation, setOccupation] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pastApplications, setPastApplications] = useState<LoanApplicationRow[]>([]);

  // Prefill full name once customer loads
  useEffect(() => {
    if (customer && !fullName) {
      setFullName(`${customer.firstName} ${customer.lastName}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const loadApplications = useCallback(async () => {
    const rows = await getMyLoanApplications();
    setPastApplications(rows);
  }, []);

  useEffect(() => {
    if (customer) loadApplications();
  }, [customer, loadApplications]);

  if (loading || !account || !customer) return <p className="text-sm text-muted-foreground">Loading...</p>;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please upload a JPG or PNG file.");
      return;
    }
    setSignatureFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("Select a loan type.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Enter your full name.");
      return;
    }
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid loan amount.");
      return;
    }
    const incomeValue = Number(income);
    if (!incomeValue || incomeValue <= 0) {
      toast.error("Enter your annual income.");
      return;
    }
    if (!occupation.trim()) {
      toast.error("Enter your occupation.");
      return;
    }
    if (!signatureFile) {
      toast.error("Please upload your signature (JPG/PNG).");
      return;
    }

    setSubmitting(true);

    // monthly_income is stored in ₹; the form collects annual income
    // in LPA (lakhs per annum), so convert: LPA * 100000 / 12.
    const monthlyIncome = (incomeValue * 100000) / 12;

    const result = await createLoanRequest({
      loanType: selected,
      amount: value,
      purpose: purpose.trim() || `${selected} — ${assets.trim() || "no assets listed"} — ${tenure} month tenure`,
      monthlyIncome,
      occupation: occupation.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Your ${selected} application has been submitted for review.`);
    setSuccess(result.loanId as string);
    loadApplications();
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md text-center py-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400 mb-4" />
        <h2 className="font-display text-xl font-semibold">Application Submitted</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your loan application has been received and is waiting for Admin Verification.
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-3">Reference: {success}</p>
        <Button
          className="mt-6"
          onClick={() => {
            setSuccess(null);
            setSelected(null);
            setAmount("");
            setPurpose("");
            setAssets("");
            setIncome("");
            setOccupation("");
            setSignatureFile(null);
          }}
        >
          Apply for Another Loan
        </Button>
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        icon={Landmark}
        title="Apply for a Loan"
        description="Choose a loan type and submit your application"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {LOAN_TYPES.map(({ type, icon: Icon, description }) => (
          <Card
            key={type}
            onClick={() => setSelected(type)}
            className={cn(
              "cursor-pointer p-4 transition-all",
              selected === type
                ? "border-[hsl(var(--gold))]/60 bg-[hsl(var(--gold))]/5"
                : "hover:border-white/20"
            )}
          >
            <Icon className="h-5 w-5 text-[hsl(var(--gold))] mb-2" />
            <p className="text-sm font-medium">{type}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            {selected ? `Applying for: ${selected}` : "Select a loan type above to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  placeholder="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Loan Tenure (months)</Label>
                <Input
                  id="tenure"
                  type="number"
                  min={3}
                  max={360}
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. Home renovation"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assets">Assets</Label>
                <Input
                  id="assets"
                  placeholder="e.g. Owned flat, FD of ₹2L"
                  value={assets}
                  onChange={(e) => setAssets(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Annual Income (LPA)</Label>
                <Input
                  id="income"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="6.5"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="e.g. Software Engineer, Business Owner"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Signature Upload (JPG/PNG)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground hover:border-[hsl(var(--gold))]/50"
              >
                <Upload className="h-4 w-4" />
                {signatureFile ? signatureFile.name : "Click to upload your signature"}
              </button>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-2">
              <Clock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">CIBIL Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  CIBIL Score will be updated by the Bank after verification. Status: Pending CIBIL
                  Verification.
                </p>
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                Requesting {formatINR(Number(amount))} over {tenure} months.
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={submitting || !selected}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pastApplications.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold mb-3">Your Applications</h2>
          <div className="space-y-2">
            {pastApplications.map((loan) => {
              const statusTone =
                loan.status === "approved"
                  ? "text-emerald-400"
                  : loan.status === "rejected"
                    ? "text-red-400"
                    : "text-amber-400";
              return (
                <div
                  key={loan.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{loan.loan_category ?? loan.loan_type}</p>
                    <p className="text-xs text-muted-foreground font-mono">{loan.id.slice(0, 8)}</p>
                    <p className={cn("text-xs mt-1", statusTone)}>
                      CIBIL: {loan.cibil_score ?? "Waiting for Admin Verification"}
                    </p>
                    {loan.status === "rejected" && loan.rejection_reason && (
                      <p className="text-xs text-red-400/80 mt-1">Reason: {loan.rejection_reason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatINR(loan.amount)}</p>
                    <p className={cn("text-xs capitalize", statusTone)}>{loan.status.replace("_", " ")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
