import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import "@/styles/print.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RZE Bank — Secure. Smart. Simple.",
  description:
    "India's most trusted digital banking platform. Experience next-generation banking with AI-powered insights, instant transfers, smart investments, and enterprise-grade security.",
  keywords: [
    "RZE Bank",
    "digital banking",
    "online banking India",
    "fixed deposit",
    "personal loan",
    "savings account",
  ],
  openGraph: {
    title: "RZE Bank — Secure. Smart. Simple.",
    description: "India's Most Trusted Digital Bank",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
