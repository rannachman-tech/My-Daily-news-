"use client";

import { useEffect, useState } from "react";
import { SOURCES } from "@/lib/sources";
import { TOPICS } from "@/lib/topics";
import { formatLocalTime } from "@/lib/time";

interface Props {
  generatedAt: string;
}

export function Footer({ generatedAt }: Props) {
  const [updated, setUpdated] = useState<string>("");

  useEffect(() => {
    setUpdated(formatLocalTime(generatedAt));
  }, [generatedAt]);

  return (
    <footer className="border-t border-border bg-surface-2 mt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-fg">Daily Digest</p>
            <p className="mt-1 text-xs text-fg-muted max-w-md">
              A free, no-ads, no-tracking morning news digest. All headlines link to original sources.
            </p>
            {updated && (
              <p className="mt-3 text-[11px] font-mono text-fg-subtle">
                Last refreshed {updated}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-xs">
            {TOPICS.map((t) => {
              const list = SOURCES.filter((s) => s.topic === t.id);
              if (list.length === 0) return null;
              return (
                <div key={t.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-1.5">
                    {t.shortLabel}
                  </p>
                  <ul className="space-y-1">
                    {list.map((s) => (
                      <li key={s.id}>
                        <a
                          href={s.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring rounded-sm text-fg-muted hover:text-fg transition-colors"
                        >
                          {s.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
