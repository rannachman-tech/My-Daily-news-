"use client";

import type { TopicId } from "@/lib/types";
import { TOPICS } from "@/lib/topics";

interface Props {
  selected: TopicId[];
  onToggle: (t: TopicId) => void;
}

export function TopicFilter({ selected, onToggle }: Props) {
  const set = new Set(selected);
  const allActive = selected.length === TOPICS.length;

  return (
    <div
      role="group"
      aria-label="Filter by topic"
      className="flex flex-wrap items-center gap-2"
    >
      {TOPICS.map((t) => {
        const active = set.has(t.id) && !allActive;
        const everythingOn = allActive;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            aria-pressed={set.has(t.id)}
            className={`focus-ring inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              everythingOn
                ? "border-border bg-surface text-fg-muted hover:text-fg hover:border-border-strong"
                : active
                ? "border-fg bg-fg text-bg"
                : "border-border bg-surface text-fg-muted hover:text-fg hover:border-border-strong"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
