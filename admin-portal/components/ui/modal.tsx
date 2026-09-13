"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "glass-strong relative w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {title && <h3 className="font-display text-lg font-semibold pr-6">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
