"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/supabase/admin";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export function AdminTopbar({ admin }: { admin: AdminUser }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.replace("/login");
    router.refresh();
  }

  const initials = admin.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#0B1230] px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-64 border-white/10 bg-[#070B1A] p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <p className="hidden text-sm text-muted-foreground sm:block">Admin Portal</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--gold))]/15 text-xs font-semibold text-[hsl(var(--gold))]">
            {initials}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </div>
    </header>
  );
}
