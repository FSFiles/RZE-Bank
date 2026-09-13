import type { MockTransaction, SpendCategory } from "./types";

const EXPENSE_TYPES = new Set(["withdraw", "transfer_out"]);
const INCOME_TYPES = new Set(["deposit", "transfer_in"]);

function isExpense(t: MockTransaction) {
  return EXPENSE_TYPES.has(t.type) && t.category !== "Income";
}
function isIncome(t: MockTransaction) {
  return INCOME_TYPES.has(t.type) || t.category === "Income";
}

export function categoryBreakdown(transactions: MockTransaction[]) {
  const map = new Map<SpendCategory, number>();
  transactions.filter(isExpense).forEach((t) => {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  });
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function last6MonthsComparison(transactions: MockTransaction[]) {
  const months: { key: string; label: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      income: 0,
      expense: 0,
    });
  }
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (!bucket) return;
    if (isIncome(t)) bucket.income += t.amount;
    else if (isExpense(t)) bucket.expense += t.amount;
  });
  return months;
}

export function last7DaysSpending(transactions: MockTransaction[]) {
  const days: { key: string; label: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      amount: 0,
    });
  }
  transactions.filter(isExpense).forEach((t) => {
    const key = new Date(t.date).toDateString();
    const bucket = days.find((d) => d.key === key);
    if (bucket) bucket.amount += t.amount;
  });
  return days;
}

export function savingsTrend(transactions: MockTransaction[]) {
  const months = last6MonthsComparison(transactions);
  let running = 0;
  return months.map((m) => {
    running += m.income - m.expense;
    return { label: m.label, savings: running };
  });
}

export function monthTotals(transactions: MockTransaction[], monthsAgo: number) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const isSameMonth = (d: Date) =>
    d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();

  let income = 0;
  let expense = 0;
  const byCategory = new Map<SpendCategory, number>();

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (!isSameMonth(d)) return;
    if (isIncome(t)) income += t.amount;
    else if (isExpense(t)) {
      expense += t.amount;
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }
  });

  return { income, expense, byCategory };
}

export function generateInsights(transactions: MockTransaction[]): string[] {
  const insights: string[] = [];
  const thisMonth = monthTotals(transactions, 0);
  const lastMonth = monthTotals(transactions, 1);

  const savedThisMonth = thisMonth.income - thisMonth.expense;
  if (savedThisMonth > 0) {
    insights.push(`You saved ₹${savedThisMonth.toLocaleString("en-IN")} this month.`);
  } else if (savedThisMonth < 0) {
    insights.push(`You spent ₹${Math.abs(savedThisMonth).toLocaleString("en-IN")} more than you earned this month.`);
  }

  thisMonth.byCategory.forEach((amount, category) => {
    const prevAmount = lastMonth.byCategory.get(category) ?? 0;
    if (prevAmount > 0) {
      const change = ((amount - prevAmount) / prevAmount) * 100;
      if (change >= 15) {
        insights.push(`You spent ${Math.round(change)}% more on ${category} this month.`);
      } else if (change <= -15) {
        insights.push(`You spent ${Math.round(Math.abs(change))}% less on ${category} this month. Nice work!`);
      }
    }
  });

  const savingsRateThis = thisMonth.income > 0 ? savedThisMonth / thisMonth.income : 0;
  const lastSaved = lastMonth.income - lastMonth.expense;
  const savingsRateLast = lastMonth.income > 0 ? lastSaved / lastMonth.income : 0;
  if (savingsRateThis > savingsRateLast && thisMonth.income > 0) {
    insights.push("Your savings rate is improving compared to last month.");
  }

  if (savedThisMonth > 5000) {
    insights.push("Consider moving some of your savings into a Fixed Deposit to earn more interest.");
  }

  const topCategory = categoryBreakdown(transactions)[0];
  if (topCategory) {
    insights.push(`${topCategory.category} is your biggest spending category overall.`);
  }

  return insights.slice(0, 5);
}

export function financialHealthScore(transactions: MockTransaction[], balance: number): number {
  const thisMonth = monthTotals(transactions, 0);
  const savingsRate = thisMonth.income > 0 ? (thisMonth.income - thisMonth.expense) / thisMonth.income : 0.3;

  const savingsScore = Math.max(0, Math.min(40, (savingsRate + 0.2) * 80)); // up to 40
  const balanceScore = Math.max(0, Math.min(30, (balance / 100000) * 30)); // up to 30
  const activityScore = Math.max(0, Math.min(20, transactions.length * 1.2)); // up to 20
  const expenseSpread = categoryBreakdown(transactions).length;
  const diversityScore = Math.max(0, Math.min(10, expenseSpread * 1.5)); // up to 10

  const total = savingsScore + balanceScore + activityScore + diversityScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}
