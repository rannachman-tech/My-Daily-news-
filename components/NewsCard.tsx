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

  return (
    <article className="group rounded-xl border border-border bg-surface p-4 sm:p-5 transition-colors hover:border-border-strong flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 font-medium text-fg-muted">
          {topic?.shortLabel ?? cluster.topic}
        </span>
        <span className="font-mono text-fg-subtle">
          {timeAgo(cluster.published_at)}
        </span>
      </div>

      <h3 className="text-[17px] leading-snug font-semibold tracking-tight text-fg">
        {primary ? (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm group-hover:text-accent transition-colors"
          >
            {cluster.headline}
          </a>
        ) : (
          cluster.headline
        )}
      </h3>

      <p className="text-[13.5px] leading-relaxed text-fg-muted line-clamp-3">
        {cluster.summary}
      </p>

      <div className="mt-auto pt-2">
        <SourcePills sources={cluster.sources} max={3} />
      </div>
    </article>
  );
}
