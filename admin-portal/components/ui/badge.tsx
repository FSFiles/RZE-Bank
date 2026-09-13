import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-r from-blue-500 to-violet-500 text-white",
        secondary: "border-white/10 bg-white/5 text-slate-200",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        danger: "border-red-500/20 bg-red-500/10 text-red-400",
        gold: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        outline: "border-white/15 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
