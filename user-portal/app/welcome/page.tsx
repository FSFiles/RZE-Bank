import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/supabase/customer";
import { WelcomeReveal } from "./welcome-reveal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WelcomePage() {
  const session = await getCustomerSession();

  if (!session || !session.account) {
    redirect("/login");
  }

  return (
    <WelcomeReveal
      firstName={session.customer.first_name}
      customerId={session.customer.customer_id}
      accountNumber={session.account.account_number}
    />
  );
}
