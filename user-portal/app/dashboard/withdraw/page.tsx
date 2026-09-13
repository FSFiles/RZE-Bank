import { requireCustomer } from "@/lib/supabase/customer";
import { WithdrawClient } from "./withdraw-client";

export default async function WithdrawPage() {
  const { account } = await requireCustomer();
  return <WithdrawClient balance={account.balance} />;
}
