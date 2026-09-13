import { requireCustomer } from "@/lib/supabase/customer";
import { DepositClient } from "./deposit-client";

export default async function DepositPage() {
  const { customer, account } = await requireCustomer();
  return (
    <DepositClient
      balance={account.balance}
      customerName={`${customer.first_name} ${customer.last_name}`}
      customerId={customer.customer_id}
    />
  );
}
