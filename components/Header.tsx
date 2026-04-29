"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { formatLocalDate, formatLocalTime } from "@/lib/time";
import type { ThemeMode } from "@/lib/types";

interface Props {
  generatedAt: string;
  theme: ThemeMode;
  onThemeChange: (t: ThemeMode) => void;
}

export function Header({ generatedAt, theme, onThemeChange }: Props) {
  const [date, setDate] = useState<string>("");
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    setDate(formatLocalDate());
    setUpdated(formatLocalTime(generatedAt));
  }, [generatedAt]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            {date && (
              <span className="hidden md:inline text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                {date}
              </span>
            )}
            {updated && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-fg-subtle">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                {updated}
              </span>
            )}
            <ThemeToggle value={theme} onChange={onThemeChange} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <a href="/" className="focus-ring flex items-center gap-2 rounded-md" aria-label="Daily Digest home">
      <span
        className="inline-flex items-center justify-center h-6 w-6 rounded-[7px] text-[11px] font-bold tracking-tight"
        style={{
          background: "linear-gradient(135deg, rgb(var(--fg)) 0%, rgb(var(--fg-muted)) 100%)",
          color: "rgb(var(--bg))",
        }}
      >
        D
      </span>
      <span className="text-[14px] font-semibold tracking-[-0.01em]">Daily Digest</span>
    </a>
  );
}
