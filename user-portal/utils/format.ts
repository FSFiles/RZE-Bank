/**
 * Formats a number as Indian Rupee currency (e.g. ₹5,00,000)
 */
export function formatINR(value: number, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number using the Indian numbering system (lakh/crore grouping)
 */
export function formatIndianNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Compact currency label like "₹5L", "₹2Cr"
 */
export function formatCompactINR(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(value % 1_00_00_000 === 0 ? 0 : 1)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(value % 1_00_000 === 0 ? 0 : 1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `₹${value}`;
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return { emi, totalPayable: principal, totalInterest: 0 };
  }
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;
  return { emi, totalPayable, totalInterest };
}
