import { requireCustomer } from "@/lib/supabase/customer";
import { TransferClient } from "./transfer-client";

export default async function TransferPage() {
  const { account } = await requireCustomer();
  return <TransferClient balance={account.balance} />;
}
