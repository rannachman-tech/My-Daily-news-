"use client";

import type { NewsCluster } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";
import { timeAgo } from "@/lib/time";
import { SourcePills } from "./SourcePills";

interface Props {
  cluster: NewsCluster;
}

export function NewsCard({ cluster }: Props) {
  const topic = TOPIC_BY_ID[cluster.topic];
  const primary = cluster.sources[0];
  const ageMs = Date.now() - new Date(cluster.published_at).getTime();
  const isFresh = ageMs < 60 * 60 * 1000;

  return (
    <article className="group relative flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
        <span className="inline-flex items-center gap-1.5 text-fg-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} aria-hidden />
          {topic?.shortLabel ?? cluster.topic}
        </span>
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
      <h3 className="text-[18px] leading-[1.25] font-semibold tracking-[-0.01em] text-fg">
        {primary ? (
          <a href={primary.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm transition-colors group-hover:text-accent">
            <span
              
            className="bg-[length:0%_1px] bg-no-repeat bg-bottom group-hover:bg-[length:100%_1px] transition-[background-size] duration-300"
              style={{ backgroundImage: `linear-gradient(${topic?.hue}, ${topic?.hue})` }}
            >
              {cluster.headline}
            </span>
          </a>
        ) : (
          cluster.headline
        )}
      </h3>
      <p className="text-[13.5px] leading-[1.55] text-fg-muted line-clamp-3">
        {cluster.summary}
      </p>
      <div className="mt-1">
        <SourcePills sources={cluster.sources} max={3} />
      </div>
    </article>
  );
}
