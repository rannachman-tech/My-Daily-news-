"use client";

import { useEffect, useMemo, useState } from "react";
import type { NewsFeed, TopicId } from "@/lib/types";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/storage";
import { withinWindow } from "@/lib/time";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { TopicFilter } from "./TopicFilter";
import { NewsCard } from "./NewsCard";
import { Footer } from "./Footer";

const DEFAULT_PREFS: Prefs = {
  topics: [],
  theme: "system",
  window: "24h",
  hideRead: false,
  readIds: [],
};

interface Props {
  feed: NewsFeed;
}

export function DigestApp({ feed }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePrefs(prefs);
  }, [prefs, hydrated]);

  const filtered = useMemo(() => {
    const topicFilter = new Set(prefs.topics);
    const filterActive = topicFilter.size > 0;
    return feed.clusters
      .filter((c) => (filterActive ? topicFilter.has(c.topic) : true))
      .filter((c) => withinWindow(c.published_at, prefs.window))
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }, [feed.clusters, prefs.topics, prefs.window]);

  const heroClusters = filtered.slice(0, 5);
  const gridClusters = filtered;

  function setTopics(topics: TopicId[]) {
    setPrefs((p: Prefs) => ({ ...p, topics }));
  }

  function setTheme(theme: Prefs["theme"]) {
    setPrefs((p: Prefs) => ({ ...p, theme }));
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }

  function setWindow(w: Prefs["window"]) {
    setPrefs((p: Prefs) => ({ ...p, window: w }));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        generatedAt={feed.generated_at}
        theme={prefs.theme}
        onThemeChange={setTheme}
      />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
          {heroClusters.length > 0 && <Hero clusters={heroClusters} />}

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <TopicFilter selected={prefs.topics} onChange={setTopics} />
            <WindowToggle value={prefs.window} onChange={setWindow} />
          </div>

          <div className="mt-8">
            {gridClusters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                {gridClusters.map((c) => (
                  <NewsCard key={c.id} cluster={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer generatedAt={feed.generated_at} />
    </div>
  );
}

function WindowToggle({
  value,
  onChange,
}: {
  value: Prefs["window"];
  onChange: (w: Prefs["window"]) => void;
}) {
  const opts: { id: Prefs["window"]; label: string }[] = [
    { id: "12h", label: "12h" },
    { id: "24h", label: "24h" },
    { id: "week", label: "Week" },
  ];
  return (
    <div className="inline-flex items-center gap-px rounded-md bg-surface-2 p-0.5 self-start sm:self-auto">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`focus-ring px-2.5 py-1 text-[11px] font-mono tracking-wide rounded-[5px] transition-all ${
            value === o.id
              ? "bg-bg text-fg shadow-[0_0_0_1px_rgb(var(--border))]"
              : "text-fg-muted hover:text-fg"
          }`}
          aria-pressed={value === o.id}
        >
          {o.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <p className="text-fg font-medium">Nothing in this window.</p>
      <p className="mt-1 text-sm text-fg-muted">
        Try a wider time range or different topics.
      </p>
    </div>
  );
}
