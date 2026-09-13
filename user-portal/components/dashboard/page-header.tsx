"use client";

import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { isValidElement, createElement, type ReactNode } from "react";

/**
 * lucide-react icons are React.forwardRef components: plain functions have
 * typeof "function", but forwardRef-wrapped components are objects shaped
 * like `{ $$typeof: Symbol(react.forward_ref), render: fn }`. Both need to
 * be recognized as "a component to render", not a function per se.
 */
function isComponentType(value: unknown): value is LucideIcon {
  if (typeof value === "function") return true;
  return (
    typeof value === "object" &&
    value !== null &&
    "$$typeof" in value &&
    "render" in value
  );
}

export function DashboardPageHeader({
  icon,
  title,
  description,
}: {
  /**
   * Accepts either a rendered icon element (e.g. `<Bell />`, safe to pass
   * from Server Components) or, for client-side callers only, a raw
   * lucide-react icon component reference.
   */
  icon: ReactNode | LucideIcon;
  title: string;
  description: string;
}) {
  const renderedIcon = isValidElement(icon)
    ? icon
    : isComponentType(icon)
      ? createElement(icon, { className: "h-5 w-5 text-[hsl(var(--gold))]" })
      : icon;

  return (
    <div className="mb-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] [&_svg]:h-5 [&_svg]:w-5">
          {renderedIcon}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
