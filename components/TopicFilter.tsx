"use client";

import type { TopicId } from "@/lib/types";
import { TOPICS } from "@/lib/topics";

interface Props {
  selected: TopicId[];
  onChange: (next: TopicId[]) => void;
}

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
      <button type="button" onClick={() => onChange([])} aria-pressed={allActive} className={`focus-ring flex-shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium tracking-tight transition-all ${allActive ? "bg-fg text-bg" : "text-fg-muted hover:text-fg"}`}>
        All
      </button>
      <span className="flex-shrink-0 h-4 w-px bg-border mx-0.5" aria-hidden />
      {TOPICS.map((t) => {
        const active = set.has(t.id);
        return (
          <button key={t.id} type="button" onClick={() => toggle(t.id)} aria-pressed={active} className={`focus-ring flex-shrink-0 inline-flex items-center gap-1.5 roun
