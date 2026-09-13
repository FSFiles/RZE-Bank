"use client";

import { useState } from "react";
import { LifeBuoy, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAccountSession } from "@/lib/supabase/use-customer-account-session";
import { addComplaint, genComplaintId, getComplaints } from "@/lib/mock/store";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I reset my transaction PIN?",
    a: "Go to Dashboard → Security Center → Transaction PIN, verify your identity, and set a new 4-digit PIN.",
  },
  {
    q: "How long does a deposit take to reflect?",
    a: "Deposits show as Pending until a branch staff member verifies your Deposit Code, after which the amount is credited to your account.",
  },
  {
    q: "Is my money safe with RZE Bank?",
    a: "Yes — all transfers require your Transaction PIN, and we monitor logins with Security Alerts and Two-Factor Authentication.",
  },
  {
    q: "How do I increase my debit card limit?",
    a: "Visit Dashboard → Cards → Card Limits to update your daily spending limit instantly.",
  },
  {
    q: "How is my Financial Health Score calculated?",
    a: "It factors in your savings rate, account balance, transaction activity, and spending diversity across categories.",
  },
];

export default function HelpCenterPage() {
  const { loading, account } = useCustomerAccountSession();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (loading || !account) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const complaints = getComplaints(account.accountNumber);

  async function handleComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in both the subject and description.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    addComplaint({
      id: genComplaintId(),
      accountNumber: account!.accountNumber,
      subject: subject.trim(),
      description: description.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    });
    setSubject("");
    setDescription("");
    setSubmitting(false);
    toast.success("Complaint raised. We'll get back to you shortly.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DashboardPageHeader icon={LifeBuoy} title="Help Center" description="FAQs, live chat, and complaint tracking" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-[hsl(var(--gold))]" /> Live Chat
          </CardTitle>
          <CardDescription>Chat with our support team in real time</CardDescription>
        </CardHeader>
        <CardContent>
          {!chatOpen ? (
            <Button onClick={() => setChatOpen(true)} className="gap-2">
              <MessageCircle className="h-4 w-4" /> Start Live Chat
            </Button>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-white">RZE Support:</span> Hi! Thanks for reaching
                out — an agent will be with you shortly. In the meantime, feel free to browse the FAQs
                above or raise a complaint below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raise a Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComplaint} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[hsl(var(--gold))]/50"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Raise Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {complaints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Track Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {complaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.subject}</p>
                  <p className="text-xs font-mono text-muted-foreground">{c.id}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    c.status === "open" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
                    c.status === "in_progress" && "border-blue-500/30 bg-blue-500/10 text-blue-400",
                    c.status === "resolved" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  )}
                >
                  {c.status === "resolved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
