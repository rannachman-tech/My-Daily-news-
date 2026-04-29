"use client";

import { useState } from "react";
import type { NewsSourceLink } from "@/lib/types";

interface Props {
  sources: NewsSourceLink[];
  max?: number;
}

function faviconUrl(homepage: string): string {
  try {
    const u = new URL(homepage);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return "";
  }
}

export function SourcePills({ sources, max = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sources : sources.slice(0, max);
  const hidden = sources.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
          title={`Read on ${s.name}`}
        >
          <img
            src={faviconUrl(s.homepage)}
            alt=""
            width={12}
            height={12}
            className="h-3 w-3 rounded-sm"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="truncate max-w-[120px]">{s.name}</span>
        </a>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="focus-ring inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}
