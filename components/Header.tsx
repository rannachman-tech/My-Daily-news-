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
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Wordmark />
            <span
              className="hidden sm:inline-block h-4 w-px bg-border"
              aria-hidden
            />
            <span className="hidden sm:inline text-sm text-fg-muted truncate">
              {date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {updated && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-mono text-fg-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Updated {updated}
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
    <a
      href="/"
      className="focus-ring flex items-center gap-2 rounded-md"
      aria-label="Daily Digest home"
    >
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-fg text-bg text-[12px] font-bold tracking-tight">
        D
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        Daily Digest
      </span>
    </a>
  );
}
