import type {
  MockCustomer,
  MockAccount,
  MockTransaction,
  MockLoanApplication,
  NotificationSettings,
  SecuritySettings,
  MockNotification,
  NotificationCategory,
  MockGoal,
  MockCard,
  MockFixedDeposit,
  MockComplaint,
  MockServiceRequest,
  DeviceSession,
  SpendCategory,
} from "./types";

const KEYS = {
  customers: "rze_mock_customers",
  accounts: "rze_mock_accounts",
  transactions: "rze_mock_transactions",
  loans: "rze_mock_loans",
  notifications: "rze_mock_notifications",
  notificationSettings: "rze_mock_notification_settings",
  securitySettings: "rze_mock_security_settings",
  goals: "rze_mock_goals",
  cards: "rze_mock_cards",
  fixedDeposits: "rze_mock_fds",
  complaints: "rze_mock_complaints",
  serviceRequests: "rze_mock_service_requests",
  session: "rze_mock_session", // holds the logged-in customerId
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ---------- id / number generators ----------

export function nextCustomerId(): string {
  const customers = read<MockCustomer[]>(KEYS.customers, []);
  const n = customers.length + 1;
  return `RZE-CUST-${String(n).padStart(6, "0")}`;
}

export function nextAccountNumber(): string {
  const accounts = read<MockAccount[]>(KEYS.accounts, []);
  const year = new Date().getFullYear();
  const n = accounts.length + 1;
  return `RZE${year}${String(n).padStart(8, "0")}`;
}

function shortId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now()
    .toString()
    .slice(-4)}`;
}

export function genTxnId(): string {
  return shortId("TXN");
}

export function genDepositCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEP-${year}-${rand}`;
}

export function genWithdrawalId(): string {
  return shortId("WD");
}

export function genLoanId(): string {
  return shortId("LOAN");
}

export function genGoalId(): string {
  return shortId("GOAL");
}

export function genFdId(): string {
  return shortId("FD");
}

export function genComplaintId(): string {
  return shortId("CMP");
}

export function genServiceRequestId(): string {
  return shortId("SR");
}

// ---------- customers ----------

export function getCustomers(): MockCustomer[] {
  return read<MockCustomer[]>(KEYS.customers, []);
}

export function saveCustomer(customer: MockCustomer) {
  const all = getCustomers();
  all.push(customer);
  write(KEYS.customers, all);
}

export function updateCustomer(customerId: string, patch: Partial<MockCustomer>) {
  const all = getCustomers().map((c) =>
    c.customerId === customerId ? { ...c, ...patch } : c
  );
  write(KEYS.customers, all);
}

export function findCustomerById(customerId: string): MockCustomer | undefined {
  return getCustomers().find((c) => c.customerId === customerId);
}

export function findCustomerByEmailOrPhone(emailOrPhone: string) {
  const v = emailOrPhone.trim().toLowerCase();
  return getCustomers().find(
    (c) => c.email.toLowerCase() === v || c.mobileNumber === emailOrPhone.trim()
  );
}

// ---------- transaction PIN ----------

export function hasTransactionPin(customerId: string): boolean {
  const customer = findCustomerById(customerId);
  return Boolean(customer?.transactionPin);
}

export function setTransactionPin(customerId: string, pin: string) {
  updateCustomer(customerId, { transactionPin: pin });
}

export function verifyTransactionPin(customerId: string, pin: string): boolean {
  const customer = findCustomerById(customerId);
  return Boolean(customer?.transactionPin && customer.transactionPin === pin);
}

// ---------- accounts ----------

export function getAccounts(): MockAccount[] {
  return read<MockAccount[]>(KEYS.accounts, []);
}

export function saveAccount(account: MockAccount) {
  const all = getAccounts();
  all.push(account);
  write(KEYS.accounts, all);
}

export function findAccountByCustomerId(customerId: string): MockAccount | undefined {
  return getAccounts().find((a) => a.customerId === customerId);
}

export function updateAccountBalance(accountNumber: string, newBalance: number) {
  const all = getAccounts().map((a) =>
    a.accountNumber === accountNumber ? { ...a, balance: newBalance } : a
  );
  write(KEYS.accounts, all);
}

export function updateAccount(accountNumber: string, patch: Partial<MockAccount>) {
  const all = getAccounts().map((a) =>
    a.accountNumber === accountNumber ? { ...a, ...patch } : a
  );
  write(KEYS.accounts, all);
}

export function findAccountByNumber(accountNumber: string): MockAccount | undefined {
  return getAccounts().find((a) => a.accountNumber === accountNumber);
}

// ---------- transactions ----------

export function getTransactions(accountNumber?: string): MockTransaction[] {
  const all = read<MockTransaction[]>(KEYS.transactions, []);
  const sorted = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return accountNumber ? sorted.filter((t) => t.accountNumber === accountNumber) : sorted;
}

export function addTransaction(txn: MockTransaction) {
  const all = read<MockTransaction[]>(KEYS.transactions, []);
  all.push(txn);
  write(KEYS.transactions, all);
}

// ---------- loans ----------

export function getLoans(accountNumber?: string): MockLoanApplication[] {
  const all = read<MockLoanApplication[]>(KEYS.loans, []);
  return accountNumber ? all.filter((l) => l.accountNumber === accountNumber) : all;
}

export function addLoan(loan: MockLoanApplication) {
  const all = read<MockLoanApplication[]>(KEYS.loans, []);
  all.push(loan);
  write(KEYS.loans, all);
}

// ---------- notifications ----------

export function getNotifications(): MockNotification[] {
  return read<MockNotification[]>(KEYS.notifications, []);
}

export function addNotification(n: MockNotification) {
  const all = getNotifications();
  all.unshift(n);
  write(KEYS.notifications, all.slice(0, 50));
}

export function notify(
  title: string,
  message: string,
  category: NotificationCategory = "general"
) {
  addNotification({
    id: crypto.randomUUID(),
    title,
    message,
    category,
    date: new Date().toISOString(),
    read: false,
  });
}

export function markNotificationRead(id: string) {
  const all = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  write(KEYS.notifications, all);
}

export function markAllNotificationsRead() {
  const all = getNotifications().map((n) => ({ ...n, read: true }));
  write(KEYS.notifications, all);
}

export function getNotificationSettings(): NotificationSettings {
  return read<NotificationSettings>(KEYS.notificationSettings, {
    transactionAlerts: true,
    loanUpdates: true,
    promotionalOffers: false,
    emailNotifications: true,
    smsNotifications: true,
  });
}

export function saveNotificationSettings(settings: NotificationSettings) {
  write(KEYS.notificationSettings, settings);
}

export function getSecuritySettings(): SecuritySettings {
  return read<SecuritySettings>(KEYS.securitySettings, {
    twoFactorEnabled: false,
    biometricEnabled: false,
    loginAlerts: true,
  });
}

export function saveSecuritySettings(settings: SecuritySettings) {
  write(KEYS.securitySettings, settings);
}

// ---------- goals ----------

export function getGoals(accountNumber: string): MockGoal[] {
  return read<MockGoal[]>(KEYS.goals, []).filter((g) => g.accountNumber === accountNumber);
}

export function addGoal(goal: MockGoal) {
  const all = read<MockGoal[]>(KEYS.goals, []);
  all.push(goal);
  write(KEYS.goals, all);
}

export function contributeToGoal(goalId: string, amount: number) {
  const all = read<MockGoal[]>(KEYS.goals, []).map((g) =>
    g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g
  );
  write(KEYS.goals, all);
}

export function deleteGoal(goalId: string) {
  const all = read<MockGoal[]>(KEYS.goals, []).filter((g) => g.id !== goalId);
  write(KEYS.goals, all);
}

// ---------- cards ----------

export function getCards(accountNumber: string): MockCard[] {
  return read<MockCard[]>(KEYS.cards, []).filter((c) => c.accountNumber === accountNumber);
}

export function ensureDebitCard(accountNumber: string): MockCard {
  const existing = getCards(accountNumber);
  if (existing.length > 0) return existing[0];
  const card: MockCard = {
    id: shortId("CARD"),
    accountNumber,
    cardNumberMasked: `•••• •••• •••• ${String(Math.floor(1000 + Math.random() * 9000))}`,
    expiry: `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(
      (new Date().getFullYear() + 4) % 100
    ).padStart(2, "0")}`,
    status: "active",
    dailyLimit: 50000,
  };
  const all = read<MockCard[]>(KEYS.cards, []);
  all.push(card);
  write(KEYS.cards, all);
  return card;
}

export function updateCard(cardId: string, patch: Partial<MockCard>) {
  const all = read<MockCard[]>(KEYS.cards, []).map((c) => (c.id === cardId ? { ...c, ...patch } : c));
  write(KEYS.cards, all);
}

// ---------- fixed deposits ----------

export function getFixedDeposits(accountNumber: string): MockFixedDeposit[] {
  return read<MockFixedDeposit[]>(KEYS.fixedDeposits, []).filter(
    (f) => f.accountNumber === accountNumber
  );
}

export function addFixedDeposit(fd: MockFixedDeposit) {
  const all = read<MockFixedDeposit[]>(KEYS.fixedDeposits, []);
  all.push(fd);
  write(KEYS.fixedDeposits, all);
}

// ---------- complaints ----------

export function getComplaints(accountNumber: string): MockComplaint[] {
  return read<MockComplaint[]>(KEYS.complaints, []).filter((c) => c.accountNumber === accountNumber);
}

export function addComplaint(complaint: MockComplaint) {
  const all = read<MockComplaint[]>(KEYS.complaints, []);
  all.push(complaint);
  write(KEYS.complaints, all);
}

// ---------- bank service requests ----------

export function getServiceRequests(accountNumber: string): MockServiceRequest[] {
  return read<MockServiceRequest[]>(KEYS.serviceRequests, []).filter(
    (s) => s.accountNumber === accountNumber
  );
}

export function addServiceRequest(request: MockServiceRequest) {
  const all = read<MockServiceRequest[]>(KEYS.serviceRequests, []);
  all.push(request);
  write(KEYS.serviceRequests, all);
}

// ---------- device sessions (static mock, seeded from the current browser) ----------

export function getDeviceSessions(): DeviceSession[] {
  const ua = isBrowser() ? window.navigator.userAgent : "";
  const device = /Mobile|Android|iPhone/.test(ua) ? "Mobile Browser" : "Desktop Browser";
  return [
    {
      id: "current",
      device,
      location: "Chennai, IN",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "device-2",
      device: "iPhone 15 — RZE Bank App",
      location: "Bengaluru, IN",
      lastActive: "2 days ago",
      current: false,
    },
    {
      id: "device-3",
      device: "Chrome on Windows",
      location: "Chennai, IN",
      lastActive: "6 days ago",
      current: false,
    },
  ];
}

// ---------- session ----------

export function setSession(customerId: string) {
  write(KEYS.session, customerId);
  updateCustomer(customerId, { lastLoginAt: new Date().toISOString() });
}

export function getSession(): string | null {
  return read<string | null>(KEYS.session, null);
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.session);
}

// ---------- seed demo data on first account creation ----------

const SEED_CATEGORIES: SpendCategory[] = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Entertainment",
  "Medical",
  "Education",
];

export function seedTransactionsForAccount(accountNumber: string) {
  const existing = getTransactions(accountNumber);
  if (existing.length > 0) return;

  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  const seed: MockTransaction[] = [
    {
      id: genTxnId(),
      accountNumber,
      type: "deposit",
      amount: 25000,
      description: "Welcome bonus credit",
      status: "success",
      date: new Date(now - day * 32).toISOString(),
      category: "Income",
      location: "RZE Bank — Online",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "deposit",
      amount: 62000,
      description: "Salary credit",
      status: "success",
      date: new Date(now - day * 30).toISOString(),
      category: "Income",
      location: "RZE Bank — Online",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 2200,
      description: "Grocery & food delivery",
      status: "success",
      date: new Date(now - day * 27).toISOString(),
      category: "Food",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 4500,
      description: "Online shopping — electronics",
      status: "success",
      date: new Date(now - day * 24).toISOString(),
      category: "Shopping",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "withdraw",
      amount: 3000,
      description: "ATM cash withdrawal",
      status: "success",
      date: new Date(now - day * 20).toISOString(),
      category: "Others",
      location: "RZE ATM — T. Nagar",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 1800,
      description: "Electricity & broadband bill",
      status: "success",
      date: new Date(now - day * 17).toISOString(),
      category: "Bills",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 1200,
      description: "Movie night + dinner",
      status: "success",
      date: new Date(now - day * 14).toISOString(),
      category: "Entertainment",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 950,
      description: "Pharmacy & consultation",
      status: "success",
      date: new Date(now - day * 11).toISOString(),
      category: "Medical",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 3200,
      description: "Online course subscription",
      status: "success",
      date: new Date(now - day * 8).toISOString(),
      category: "Education",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "transfer_out",
      amount: 1500,
      description: "Transfer to UPI merchant",
      status: "success",
      date: new Date(now - day * 2).toISOString(),
      category: "Shopping",
      location: "Chennai, IN",
    },
    {
      id: genTxnId(),
      accountNumber,
      type: "deposit",
      amount: 8000,
      description: "Freelance income credit",
      status: "success",
      date: new Date(now - day).toISOString(),
      category: "Income",
      location: "RZE Bank — Online",
    },
  ];
  seed.forEach(addTransaction);
}

export function randomCategory(): SpendCategory {
  return SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];
}
