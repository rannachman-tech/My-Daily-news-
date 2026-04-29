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
import { ALL_TOPIC_IDS } from "@/lib/topics";

const DEFAULT_PREFS: Prefs = {
  topics: ALL_TOPIC_IDS,
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
    const selected = new Set(prefs.topics);
    return feed.clusters
      .filter((c) => selected.has(c.topic))
      .filter((c) => withinWindow(c.published_at, prefs.window))
      .sort((a, b) => {
        // primary: weight desc, secondary: recency desc
        if (b.weight !== a.weight) return b.weight - a.weight;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }, [feed.clusters, prefs.topics, prefs.window]);

  const heroClusters = filtered.slice(0, 5);
  const gridClusters = filtered;

  function toggleTopic(topic: TopicId) {
    setPrefs((p: Prefs) => {
      const set = new Set(p.topics);
      if (set.has(topic)) set.delete(topic);
      else set.add(topic);
      // never allow zero topics — fall back to all
      const next = set.size === 0 ? ALL_TOPIC_IDS : Array.from(set);
      return { ...p, topics: next };
    });
  }

  function setTheme(theme: Prefs["theme"]) {
    setPrefs((p: Prefs) => ({ ...p, theme }));
    // apply immediately
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {heroClusters.length > 0 && <Hero clusters={heroClusters} />}

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TopicFilter selected={prefs.topics} onToggle={toggleTopic} />
            <WindowToggle value={prefs.window} onChange={setWindow} />
          </div>

          <div className="mt-6">
            {gridClusters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5 self-start sm:self-auto">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`focus-ring px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            value === o.id
              ? "bg-surface-2 text-fg"
              : "text-fg-muted hover:text-fg"
          }`}
          aria-pressed={value === o.id}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-surface p-10 text-center">
      <p className="text-fg font-medium">Nothing in this window.</p>
      <p className="mt-1 text-sm text-fg-muted">
        Try expanding the time range or selecting more topics.
      </p>
    </div>
  );
}
