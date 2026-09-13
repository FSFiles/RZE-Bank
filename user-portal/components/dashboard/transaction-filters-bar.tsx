"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function TransactionFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card className="mb-4 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select defaultValue={searchParams.get("type") ?? "all"} onValueChange={(v) => updateParam("type", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="transfer_in">Transfer In</SelectItem>
            <SelectItem value="transfer_out">Transfer Out</SelectItem>
            <SelectItem value="admin_credit">Admin Credit</SelectItem>
            <SelectItem value="admin_debit">Admin Debit</SelectItem>
            <SelectItem value="interest_credit">Interest Credit</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" defaultValue={searchParams.get("from") ?? ""} onChange={(e) => updateParam("from", e.target.value)} />
        <Input type="date" defaultValue={searchParams.get("to") ?? ""} onChange={(e) => updateParam("to", e.target.value)} />
      </div>
    </Card>
  );
}

export function TransactionPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)} className="gap-1">
        <ChevronLeft className="h-3.5 w-3.5" /> Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goTo(page + 1)} className="gap-1">
        Next <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
