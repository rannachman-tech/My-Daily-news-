"use client";

import type { ThemeMode } from "@/lib/types";

interface Props {
  value: ThemeMode;
  onChange: (t: ThemeMode) => void;
}

export function ThemeToggle({ value, onChange }: Props) {
  // Cycles: system → light → dark → system
  function next() {
    if (value === "system") onChange("light");
    else if (value === "light") onChange("dark");
    else onChange("system");
  }

  const label =
    value === "system" ? "Theme: system" : value === "light" ? "Theme: light" : "Theme: dark";

  return (
    <button
      type="button"
      onClick={next}
      aria-label={label}
      title={label}
      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
    >
      {value === "system" ? <SystemIcon /> : value === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
