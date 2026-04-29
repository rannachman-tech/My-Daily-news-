"use client";

import { useState } from "react";
import type { NewsSourceLink } from "@/lib/types";

interface Props {
  sources: NewsSourceLink[];
  max?: number;
}

export function SourcePills({ sources, max = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sources : sources.slice(0, max);
  const hidden = sources.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono">
      {visible.map((s, i) => (
        <span key={s.url} className="inline-flex items-center gap-2">
{i > 0 && <span className="text-fg-subtle" aria-hidden>{"·"}</span>}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm text-fg-muted hover:text-fg transition-colors uppercase tracking-wider" title={`Read on ${s.name}`}>{s.name}</a>
        </span>
      ))}
      {hidden > 0 && (
        <>
          <span className="text-fg-subtle" aria-hidden>{"·"}</span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="focus-ring rounded-sm text-fg-subtle hover:text-fg-muted transition-colors uppercase tracking-wider"
          >
            +{hidden}
          </button>
        </>
      )}
    </div>
  );
}
