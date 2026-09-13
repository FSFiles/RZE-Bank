"use client";

import { useRef } from "react";

export function PinInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("");

  function setDigit(index: number, digit: string) {
    const clean = digit.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = clean;
    const joined = next.join("").slice(0, 4);
    onChange(joined);
    if (clean && index < 3) refs.current[index + 1]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-3">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          value={digits[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className="h-14 w-12 rounded-xl border border-white/15 bg-white/[0.03] text-center text-xl font-semibold text-white focus:border-[hsl(var(--gold))]/60 focus:outline-none"
        />
      ))}
    </div>
  );
}
