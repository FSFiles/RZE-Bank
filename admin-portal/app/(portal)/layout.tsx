import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#0B1230]">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={admin} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
