import { Certification } from "@/types";
import { Landmark, Network, ShieldCheck, FileCheck, CreditCard, LineChart } from "lucide-react";

export const CERTIFICATIONS: Certification[] = [
  {
    id: "rbi-registered",
    title: "RBI Registered",
    status: "Active",
    entity: "Reserve Bank of India",
    description:
      "Fully licensed and regulated by the Reserve Bank of India under the Banking Regulation Act.",
    code: "NBFC-ABC-2019-001",
    icon: Landmark,
  },
  {
    id: "npci-member",
    title: "NPCI Member",
    status: "Active",
    entity: "National Payments Corp.",
    description:
      "Authorized member of NPCI for UPI, RuPay, IMPS, and other payment infrastructure.",
    code: "NPCI-2020-0042",
    icon: Network,
  },
  {
    id: "dicgc-insured",
    title: "DICGC Insured",
    status: "Active",
    entity: "Deposit Insurance",
    description:
      "All deposits insured up to ₹5,00,000 per depositor by Deposit Insurance and Credit Guarantee Corporation.",
    code: "Up to ₹5 Lakhs",
    icon: ShieldCheck,
  },
  {
    id: "iso-27001",
    title: "ISO 27001",
    status: "Active",
    entity: "Information Security",
    description:
      "Certified to ISO 27001:2022 — the international standard for information security management systems.",
    code: "ISO/IEC 27001:2022",
    icon: FileCheck,
  },
  {
    id: "pci-dss",
    title: "PCI DSS Level 1",
    status: "Active",
    entity: "Payment Card Security",
    description:
      "Highest level of PCI DSS compliance for secure handling of cardholder data and payment transactions.",
    code: "Level 1 Certified",
    icon: CreditCard,
  },
  {
    id: "sebi-registered",
    title: "SEBI Registered",
    status: "Active",
    entity: "Investment Advisor",
    description:
      "Registered Investment Advisor with SEBI for providing investment advisory services to retail investors.",
    code: "INA000012345",
    icon: LineChart,
  },
];
