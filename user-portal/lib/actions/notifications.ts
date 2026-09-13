"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCustomerSession } from "@/lib/supabase/customer";

export async function markNotificationRead(id: string) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    revalidatePath("/dashboard/notifications");
  } catch (err) {
    console.error("markNotificationRead failed:", err);
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await getCustomerSession();
    if (!session) return;
    const supabase = await createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("customer_id", session.customer.id)
      .eq("is_read", false);
    revalidatePath("/dashboard/notifications");
  } catch (err) {
    console.error("markAllNotificationsRead failed:", err);
  }
}
