"use client";

import type { TopicId } from "@/lib/types";
import { TOPICS } from "@/lib/topics";

interface Props {
  selected: TopicId[];
  onChange: (next: TopicId[]) => void;
}

const PILL_BASE =
  "focus-ring flex-shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium tracking-tight transition-all";
const PILL_BASE_WITH_DOT = `${PILL_BASE} gap-1.5`;

const ALL_ACTIVE = "bg-fg text-bg";
const ALL_INACTIVE = "text-fg-muted hover:text-fg";

const TOPIC_ACTIVE =
  "bg-surface text-fg shadow-[inset_0_0_0_1px_rgb(var(--border-strong))]";
const TOPIC_INACTIVE = "text-fg-muted hover:text-fg";

export function TopicFilter({ selected, onChange }: Props) {
  const set = new Set(selected);
  const allActive = selected.length === 0;

  function toggle(id: TopicId) {
    if (allActive) {
      onChange([id]);
      return;
    }
    if (set.has(id)) {
      const next = selected.filter((t) => t !== id);
      onChange(next.length === 0 ? [] : next);
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div role="group" aria-label="Filter by topic" className="flex flex-nowrap items-center gap-1.5 w-max">
      <button
        type="button"
        onClick={() => onChange([])}
        aria-pressed={allActive}
        className={`${PILL_BASE} ${allActive ? ALL_ACTIVE : ALL_INACTIVE}`}
      >
        All
      </button>
      <span className="flex-shrink-0 h-4 w-px bg-border mx-0.5" aria-hidden />
      {TOPICS.map((t) => {
        const active = set.has(t.id);
        const dotStyle = {
          backgroundColor: active ? t.hue : "transparent",
          boxShadow: active ? "none" : `inset 0 0 0 1px ${t.hue}`,
        };
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            aria-pressed={active}
            className={`${PILL_BASE_WITH_DOT} ${active ? TOPIC_ACTIVE : TOPIC_INACTIVE}`}
          >
            <span className="h-1.5 w-1.5 rounded-full transition-all" style={dotStyle} aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
