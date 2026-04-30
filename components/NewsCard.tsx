"use client";

import { useState } from "react";
import type { NewsCluster } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";
import { timeAgo } from "@/lib/time";
import { SourcePills } from "./SourcePills";
import { TopicGlyph } from "./TopicGlyph";

interface Props { cluster: NewsCluster; }

export function NewsCard({ cluster }: Props) {
  const topic = TOPIC_BY_ID[cluster.topic];
  const primary = cluster.sources[0];
  const ageMs = Date.now() - new Date(cluster.published_at).getTime();
  const isFresh = ageMs < 60 * 60 * 1000;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(cluster.image_url) && !imgFailed;

  return (
    <article className="group flex flex-row rounded-xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-[0_8px_24px_-12px_rgb(0_0_0_/_0.12)] dark:hover:shadow-[0_8px_24px_-12px_rgb(0_0_0_/_0.6)] animate-fade-in">
      <a href={primary?.url} target="_blank" rel="noopener noreferrer" className="focus-ring relative block flex-shrink-0 w-[112px] sm:w-[140px] md:w-[160px] aspect-square bg-surface-2 overflow-hidden" aria-label={cluster.headline}>
        {showImage ? (
          <img src={cluster.image_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" onError={() => setImgFailed(true)} />
        ) : (
          <TopicGlyph topic={cluster.topic} variant="card" />
        )}
      </a>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5 p-3 md:p-4">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider gap-2">
          <span className="inline-flex items-center gap-1.5 text-fg-muted truncate">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} aria-hidden />
            <span className="truncate">{topic?.shortLabel ?? cluster.topic}</span>
          </span>
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-fg-subtle">
            {isFresh && (
              <span className="relative inline-flex h-1.5 w-1.5" aria-label="Breaking">
                <span className="absolute inset-0 rounded-full opacity-50 animate-ping" style={{ backgroundColor: topic?.hue ?? "currentColor" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} />
              </span>
            )}
            {timeAgo(cluster.published_at)}
          </span>
        </div>

        <h3 className="text-[14.5px] md:text-[15px] leading-[1.3] font-semibold tracking-[-0.01em] text-fg line-clamp-3">
          {primary ? (
            <a href={primary.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm transition-colors group-hover:text-accent">{cluster.headline}</a>
          ) : (
            cluster.headline
          )}
        </h3>

        <p className="hidden sm:block text-[12.5px] leading-[1.5] text-fg-muted line-clamp-2">{cluster.summary}</p>

        <div className="mt-auto pt-1">
          <SourcePills sources={cluster.sources} max={3} />
        </div>
      </div>
    </article>
  );
}
