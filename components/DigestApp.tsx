"use client";

import { useEffect, useMemo, useState } from "react";
import type { NewsFeed, TopicId } from "@/lib/types";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/storage";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { TopicFilter } from "./TopicFilter";
import { NewsCard } from "./NewsCard";
import { Footer } from "./Footer";

const DEFAULT_PREFS: Prefs = {
  topics: [],
  theme: "light",
  window: "24h",
  hideRead: false,
  readIds: [],
};

interface Props { feed: NewsFeed; }

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

  // Hero: top 5 by weight (highest source-count × recency)
  const heroSorted = useMemo(() => {
    const topicFilter = new Set(prefs.topics);
    const filterActive = topicFilter.size > 0;
    return feed.clusters
      .filter((c) => (filterActive ? topicFilter.has(c.topic) : true))
      .slice()
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }, [feed.clusters, prefs.topics]);

  // Grid: newest first, no time-window filter
  const gridSorted = useMemo(() => {
    const topicFilter = new Set(prefs.topics);
    const filterActive = topicFilter.size > 0;
    return feed.clusters
      .filter((c) => (filterActive ? topicFilter.has(c.topic) : true))
      .slice()
      .sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
  }, [feed.clusters, prefs.topics]);

  const heroClusters = heroSorted.slice(0, 5);

  function setTopics(topics: TopicId[]) {
    setPrefs((p: Prefs) => ({ ...p, topics }));
  }

  function setTheme(theme: Prefs["theme"]) {
    setPrefs((p: Prefs) => ({ ...p, theme }));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header generatedAt={feed.generated_at} theme={prefs.theme} onThemeChange={setTheme} />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
          {heroClusters.length > 0 && <Hero clusters={heroClusters} />}
        </div>

        <div className="sticky top-14 z-30 bg-bg/85 backdrop-blur-md border-y border-border">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
              <div className="relative flex-1 min-w-0">
                <div className="overflow-x-auto scrollbar-hide">
                  <TopicFilter selected={prefs.topics} onChange={setTopics} />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-bg to-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {gridSorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {gridSorted.map((c) => (
                <NewsCard key={c.id} cluster={c} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer generatedAt={feed.generated_at} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <p className="text-fg font-medium">No stories yet.</p>
      <p className="mt-1 text-sm text-fg-muted">The next refresh runs within two hours.</p>
    </div>
  );
}
