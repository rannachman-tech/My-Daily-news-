"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsCluster } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";
import { timeAgo } from "@/lib/time";
import { SourcePills } from "./SourcePills";

const ROTATE_MS = 6000;

interface Props {
  clusters: NewsCluster[];
}

export function Hero({ clusters }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Honor prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Pause when tab not visible
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Rotation
  useEffect(() => {
    if (paused || clusters.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % clusters.length);
    }, ROTATE_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, clusters.length]);

  // Reset when cluster set changes
  useEffect(() => {
    setIndex(0);
  }, [clusters.map((c) => c.id).join(",")]);

  if (clusters.length === 0) return null;

  function go(i: number) {
    setIndex(((i % clusters.length) + clusters.length) % clusters.length);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === " ") {
      e.preventDefault();
      setPaused((p) => !p);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Top stories"
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
      tabIndex={0}
    >
      {/* Slides */}
      <div className="relative h-[280px] sm:h-[300px]">
        {reduced ? (
          // Reduced-motion: only render the active slide, fade in
          <Slide cluster={clusters[index]} active />
        ) : (
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {clusters.map((c, i) => (
              <div key={c.id} className="min-w-full">
                <Slide cluster={c} active={i === index} />
              </div>
            ))}
          </div>
        )}

        {/* Edge controls */}
        {clusters.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous story"
              className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/85 backdrop-blur text-fg-muted hover:text-fg hover:border-border-strong opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Chev dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next story"
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/85 backdrop-blur text-fg-muted hover:text-fg hover:border-border-strong opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Chev dir="right" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {clusters.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {clusters.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to story ${i + 1}`}
              aria-current={i === index}
              className={`focus-ring h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-fg" : "w-1.5 bg-fg-subtle hover:bg-fg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({ cluster, active }: { cluster: NewsCluster; active: boolean }) {
  const topic = TOPIC_BY_ID[cluster.topic];
  const primary = cluster.sources[0];

  return (
    <div className="h-full p-6 sm:p-8 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 font-medium text-fg-muted">
          {topic?.label ?? cluster.topic}
        </span>
        <span className="font-mono text-fg-subtle">{timeAgo(cluster.published_at)}</span>
        {cluster.source_count >= 3 && (
          <span className="font-mono text-fg-subtle">
            · {cluster.source_count} sources
          </span>
        )}
      </div>

      <div className="mt-4 max-w-3xl">
        <h2 className="text-2xl sm:text-[28px] leading-tight font-semibold tracking-tight">
          {cluster.headline}
        </h2>
        <p className="mt-3 text-[15px] sm:text-base text-fg-muted leading-relaxed line-clamp-3">
          {cluster.summary}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <SourcePills sources={cluster.sources} max={4} />
        {primary && (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
            tabIndex={active ? 0 : -1}
          >
            Read on {primary.name}
            <ArrowRight />
          </a>
        )}
      </div>
    </div>
  );
}

function Chev({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
