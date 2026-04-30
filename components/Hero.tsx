"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsCluster } from "@/lib/types";
import { TOPIC_BY_ID } from "@/lib/topics";
import { timeAgo } from "@/lib/time";
import { TopicGlyph } from "./TopicGlyph";

const ROTATE_MS = 6000;

interface Props { clusters: NewsCluster[]; }

export function Hero({ clusters }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (paused || clusters.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % clusters.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, clusters.length, index, tick]);

  useEffect(() => {
    setIndex(0);
    setTick((t) => t + 1);
  }, [clusters.map((c) => c.id).join(",")]);

  if (clusters.length === 0) return null;

  function go(i: number) {
    setIndex(((i % clusters.length) + clusters.length) % clusters.length);
    setTick((t) => t + 1);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    else if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
  }

  const active = clusters[index];
  const topic = TOPIC_BY_ID[active.topic];
  const primary = active.sources[0];
  const showImage = Boolean(active.image_url) && !imgFailed[active.id];

  return (
    <section aria-roledescription="carousel" aria-label="Top stories" className="group relative rounded-2xl border border-border bg-surface overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onKeyDown={onKey} tabIndex={0}>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <a href={primary?.url} target="_blank" rel="noopener noreferrer" className="focus-ring relative block aspect-[16/9] md:aspect-auto md:min-h-[260px] bg-surface-2 overflow-hidden" aria-label={active.headline}>
          {showImage ? (
            <img key={active.id} src={active.image_url} alt="" loading="eager" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700" onError={() => setImgFailed((s) => ({ ...s, [active.id]: true }))} />
          ) : (
            <TopicGlyph topic={active.topic} variant="hero" />
          )}
          <div className="md:hidden absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" aria-hidden />
        </a>

        <div className="p-5 sm:p-7 md:p-8 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-subtle">
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: topic?.hue ?? "currentColor" }} aria-hidden />
            Top stories
            <span className="text-fg-subtle">{"·"}</span>
            <span>{topic?.label ?? active.topic}</span>
          </div>

          <div key={active.id} className={reduced ? "" : "animate-hero-in"}>
            <h2 className="text-[22px] sm:text-[26px] md:text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-fg line-clamp-3">
              {primary ? (
                <a href={primary.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm hover:text-accent transition-colors">{active.headline}</a>
              ) : (
                active.headline
              )}
            </h2>
            <p className="mt-2.5 text-[13.5px] sm:text-[14px] leading-relaxed text-fg-muted line-clamp-2 md:line-clamp-3">{active.summary}</p>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono uppercase tracking-wider">
            <span className="text-fg-subtle">{timeAgo(active.published_at)}</span>
            {active.sources.slice(0, 4).map((s) => (
              <span key={s.url} className="inline-flex items-center gap-2">
                <span className="text-fg-subtle" aria-hidden>{"·"}</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm text-fg-muted hover:text-fg transition-colors">{s.name}</a>
              </span>
            ))}
            {active.sources.length > 4 && (
              <span className="text-fg-subtle">{"·"} +{active.sources.length - 4}</span>
            )}
          </div>
        </div>
      </div>

      {clusters.length > 1 && (
        <div className="px-5 sm:px-7 md:px-8 pb-4 flex items-center gap-2">
          {clusters.map((c, i) => {
            const isActive = i === index;
            const isPast = i < index;
            return (
              <button key={c.id} type="button" onClick={() => go(i)} aria-label={`Go to story ${i + 1}`} aria-current={isActive} className="focus-ring relative flex-1 h-px hover:h-0.5 transition-all">
                <span className="absolute inset-0 bg-border" />
                <span key={`fill-${c.id}-${tick}-${paused ? "p" : "r"}`} className="absolute inset-y-0 left-0 bg-fg" style={{ width: isActive ? "100%" : isPast ? "100%" : "0%", animation: isActive && !paused && !reduced ? `hero-fill ${ROTATE_MS}ms linear forwards` : undefined }} />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
