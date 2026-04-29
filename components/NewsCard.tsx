"use client";

import { useState } from "react";
import type { NewsCluster } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";
import { timeAgo } from "@/lib/time";
import { SourcePills } from "./SourcePills";
import { TopicGlyph } from "./TopicGlyph";

interface Props {
  cluster: NewsCluster;
}

export function NewsCard({ cluster }: Props) {
  const topic = TOPIC_BY_ID[cluster.topic];
  const primary = cluster.sources[0];
  const ageMs = Date.now() - new Date(cluster.published_at).getTime();
  const isFresh = ageMs < 60 * 60 * 1000;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(cluster.image_url) && !imgFailed;

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-[0_8px_24px_-12px_rgb(0_0_0_/_0.12)] dark:hover:shadow-[0_8px_24px_-12px_rgb(0_0_0_/_0.6)] animate-fade-in">
      <a href={primary?.url} target="_blank" rel="noopener noreferrer" className="focus-ring block relative aspect-[16/9] bg-surface-2 overflow-hidden" aria-label={cluster.headline}>
        {showImage ? (
          <img src={cluster.image_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" onError={() => setImgFailed(true)} />
        ) : (
          <TopicGlyph topic={cluster.topic} variant="card" />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-bg/90 backdrop-blur px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-fg-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} aria-hidden />
          {topic?.shortLabel ?? cluster.topic}
        </span>
      </a>

      <div className="flex-1 flex flex-col gap-2.5 p-5">
        <div className="flex items-center justify-end text-[11px] font-mono uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5 text-fg-subtle">
            {isFresh && (
              <span className="relative inline-flex h-1.5 w-1.5" aria-label="Breaking">
                <span className="absolute inset-0 rounded-full opacity-50 animate-ping" style={{ backgroundColor: topic?.hue ?? "currentColor" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} />
              </span>
            )}
            {timeAgo(cluster.published_at)}
          </span>
        </div>
        <h3 className="text-[17px] leading-[1.3] font-semibold tracking-[-0.01em] text-fg">
          {primary ? (
            <a href={primary.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm transition-colors group-hover:text-accent">{cluster.headline}</a>
          ) : (
            cluster.headline
          )}
        </h3>
        <p className="text-[13.5px] leading-[1.55] text-fg-muted line-clamp-3">{cluster.summary}</p>
        <div className="mt-auto pt-2">
          <SourcePills sources={cluster.sources} max={3} />
        </div>
      </div>
    </article>
  );
}
