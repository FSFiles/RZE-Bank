import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  History,
  FileText,
  Landmark,
  PiggyBank,
  QrCode,
  CreditCard,
  TrendingUp,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "deposit",
    label: "Deposit",
    description: "Add money to your account",
    href: "/dashboard/deposit",
    icon: ArrowDownToLine,
  },
  {
    id: "withdraw",
    label: "Withdraw",
    description: "Generate an ATM QR withdrawal",
    href: "/dashboard/withdraw",
    icon: ArrowUpFromLine,
  },
  {
    id: "transfer",
    label: "Transfer",
    description: "Send money instantly",
    href: "/dashboard/transfer",
    icon: Send,
  },
  {
    id: "upi",
    label: "UPI",
    description: "Receive money via UPI QR",
    href: "/dashboard/upi",
    icon: QrCode,
  },
  {
    id: "loans",
    label: "Loans",
    description: "Apply for a new loan",
    href: "/dashboard/loans",
    icon: Landmark,
  },
  {
    id: "fixed-deposit",
    label: "Fixed Deposit",
    description: "Open an FD & grow savings",
    href: "/dashboard/fixed-deposit",
    icon: PiggyBank,
  },
  {
    id: "cards",
    label: "Cards",
    description: "Manage your debit card",
    href: "/dashboard/cards",
    icon: CreditCard,
  },
  {
    id: "investments",
    label: "Investments",
    description: "Explore mutual funds & bonds",
    href: "/dashboard/investments",
    icon: TrendingUp,
  },
  {
    id: "statement",
    label: "Mini Statement",
    description: "Download a recent statement",
    href: "/dashboard/statement",
    icon: FileText,
  },
  {
    id: "transactions",
    label: "Transaction History",
    description: "Search, filter & export",
    href: "/dashboard/transactions",
    icon: History,
  },
  {
    id: "support",
    label: "Support",
    description: "FAQs, chat & complaints",
    href: "/dashboard/help",
    icon: LifeBuoy,
  },
];
