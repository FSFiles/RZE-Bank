"use client";

import { useMemo, useState } from "react";
import { calculateEMI } from "@/utils/format";

export function useEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(36);

  const result = useMemo(
    () => calculateEMI(loanAmount, interestRate, tenureMonths),
    [loanAmount, interestRate, tenureMonths]
  );

  const principalShare = useMemo(
    () => Math.round((loanAmount / result.totalPayable) * 100),
    [loanAmount, result.totalPayable]
  );
  const interestShare = 100 - principalShare;

  return {
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    tenureMonths,
    setTenureMonths,
    ...result,
    principalShare,
    interestShare,
  };
}
