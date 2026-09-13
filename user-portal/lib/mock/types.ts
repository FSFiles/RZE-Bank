/**
 * TEMPORARY MOCK DATA LAYER
 * ---------------------------------------------------------------
 * Everything in lib/mock/* is a stand-in for Supabase Auth + the
 * Postgres database. It persists to localStorage only, purely so the
 * full application flow can be demoed end-to-end. Once Supabase is
 * wired back in, this entire folder can be deleted and the original
 * lib/actions/auth.ts + lib/supabase/* server flow restored.
 */

export interface MockCustomer {
  id: string; // internal uuid-ish id
  customerId: string; // RZE-CUST-000001
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  mobileNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  password: string; // plaintext only because this is a temporary mock store
  transactionPin?: string; // 4-digit transaction PIN, plaintext mock only
  photoDataUrl?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface MockAccount {
  id: string;
  customerId: string; // FK -> MockCustomer.customerId
  accountNumber: string; // RZE202600000001
  accountType: "savings" | "current";
  balance: number;
  ifsc: string;
  branch: string;
  status: "active" | "frozen" | "closed";
}

export type TransactionType =
  | "deposit"
  | "withdraw"
  | "transfer_out"
  | "transfer_in";

export type TransactionStatus = "success" | "pending" | "failed";

export type SpendCategory =
  | "Food"
  | "Shopping"
  | "Travel"
  | "Bills"
  | "Entertainment"
  | "Medical"
  | "Education"
  | "Others"
  | "Income";

export interface MockTransaction {
  id: string; // TXN-XXXXXXXX
  accountNumber: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  date: string; // ISO
  category: SpendCategory;
  location: string;
}

export type LoanType =
  | "Personal Loan"
  | "Home Loan"
  | "Education Loan"
  | "Women Empowerment Loan"
  | "Business Loan";

export interface MockLoanApplication {
  id: string; // LOAN-XXXXXXXX
  accountNumber: string;
  fullName: string;
  loanType: LoanType;
  amount: number;
  tenureMonths: number;
  purpose: string;
  assets: string;
  annualIncomeLPA: number;
  signatureFileName: string | null;
  cibilScore: number | null; // set only by Admin, never by the customer
  cibilStatus: "pending_verification" | "verified";
  status: "submitted" | "under_review" | "approved" | "rejected";
  appliedAt: string;
}

export interface NotificationSettings {
  transactionAlerts: boolean;
  loanUpdates: boolean;
  promotionalOffers: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginAlerts: boolean;
}

export type NotificationCategory =
  | "deposit"
  | "withdrawal"
  | "loan"
  | "money_received"
  | "money_sent"
  | "security"
  | "general";

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  date: string;
  read: boolean;
}

export interface MockGoal {
  id: string;
  accountNumber: string;
  name: string;
  icon: string; // lucide icon key, resolved in UI
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
}

export type CardStatus = "active" | "frozen" | "blocked";

export interface MockCard {
  id: string;
  accountNumber: string;
  cardNumberMasked: string; // •••• •••• •••• 4821
  expiry: string; // MM/YY
  status: CardStatus;
  dailyLimit: number;
}

export interface MockFixedDeposit {
  id: string; // FD-XXXXXXXX
  accountNumber: string;
  principal: number;
  tenureMonths: number;
  interestRate: number; // annual %
  maturityAmount: number;
  startDate: string;
  maturityDate: string;
  status: "active" | "matured";
}

export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface MockComplaint {
  id: string; // CMP-XXXXXXXX
  accountNumber: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
}

export type ServiceRequestType =
  | "cheque_book"
  | "debit_card"
  | "address_change"
  | "nominee_update"
  | "kyc_update";

export interface MockServiceRequest {
  id: string; // SR-XXXXXXXX
  accountNumber: string;
  type: ServiceRequestType;
  details: string;
  status: "pending" | "processing" | "completed";
  createdAt: string;
}

export interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}
