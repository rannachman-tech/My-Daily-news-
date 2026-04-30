"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SOURCES } from "@/lib/sources";
import { TOPICS } from "@/lib/topics";
import { formatLocalTime } from "@/lib/time";

interface Props {
  generatedAt: string;
}

export function Footer({ generatedAt }: Props) {
  const [updated, setUpdated] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUpdated(formatLocalTime(generatedAt));
  }, [generatedAt]);

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="mb-5 text-[11px] leading-relaxed text-fg-subtle max-w-3xl">
          For informational purposes only. Daily Digest aggregates publicly
          available headlines from third-party publishers and is not affiliated
          with them. Nothing on this site constitutes financial, investment,
          legal, or tax advice.
        </p>

        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <p className="text-[12px] text-fg-muted">
            <span className="font-semibold text-fg">Daily Digest</span>
            <span className="mx-2 text-fg-subtle">{"·"}</span>
            <Link href="/about" className="focus-ring rounded-sm hover:text-fg transition-colors">
              About
            </Link>
            {updated && (
              <>
                <span className="mx-2 text-fg-subtle">{"·"}</span>
                <span className="font-mono uppercase tracking-wider text-fg-subtle">
                  Refreshed {updated}
                </span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-[11px] font-mono uppercase tracking-wider text-fg-muted hover:text-fg transition-colors"
          >
            <span>{open ? "Hide" : "Show"} sources</span>
            <span className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
              {"▾"}
            </span>
          </button>
        </div>

        {open && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-5 text-[12px] animate-fade-in">
            {TOPICS.map((t) => {
              const list = SOURCES.filter((s) => s.topic === t.id);
              if (list.length === 0) return null;
              return (
                <div key={t.id}>
                  <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
                    <span className="h-1 w-1 rounded-full" style={{ backgroundColor: t.hue }} aria-hidden />
                    {t.shortLabel}
                  </p>
                  <ul className="space-y-1">
                    {list.map((s) => (
                    <li key={s.id}>
                        <a href={s.homepage} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm text-fg-muted hover:text-fg transition-colors">{s.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}
