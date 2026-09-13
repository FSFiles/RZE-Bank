import { Bell } from "lucide-react";
import { requireCustomer } from "@/lib/supabase/customer";
import { getCustomerNotifications } from "@/lib/customer/queries";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { customer } = await requireCustomer();
  const notifications = await getCustomerNotifications(customer.id);

  return (
    <div className="mx-auto max-w-lg">
      <DashboardPageHeader
        icon={<Bell className="h-5 w-5 text-[hsl(var(--gold))]" />}
        title="Notifications"
        description="Recent alerts and updates for your account"
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
