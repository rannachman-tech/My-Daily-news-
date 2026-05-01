import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { createHash } from "crypto";
import { fetchAll } from "./fetch";
import { clusterArticles, pickCanonicalHeadline } from "./cluster";
import { summarizeClusters } from "./summarize";
import type { NewsCluster, NewsFeed, NewsSourceLink } from "../lib/types";

const HOURS_BACK = 168;
const MAX_CLUSTERS = 60;
const OUT_PATH = resolve(process.cwd(), "data/news.json");

function id(s: string): string {
  return "evt_" + createHash("sha1").update(s).digest("hex").slice(0, 16);
}

async function main() {
  const articles = await fetchAll(HOURS_BACK);
  if (articles.length === 0) {
    console.warn("[run] no articles fetched — keeping existing news.json");
    return;
  }

  const clusters = clusterArticles(articles);
  console.log(`[run] ${clusters.length} clusters from ${articles.length} articles`);

  // Sort clusters: source_count desc, then recency
  clusters.sort((a, b) => {
    if (b.articles.length !== a.articles.length) return b.articles.length - a.articles.length;
    const tA = Math.max(...a.articles.map((x) => Date.parse(x.publishedAt)));
    const tB = Math.max(...b.articles.map((x) => Date.parse(x.publishedAt)));
    return tB - tA;
  });

  const trimmed = clusters.slice(0, MAX_CLUSTERS);

  // Load existing summaries to reuse where possible
  let existing: NewsFeed | null = null;
  if (existsSync(OUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUT_PATH, "utf-8")) as NewsFeed;
    } catch {}
  }
  const existingById = new Map<string, NewsCluster>();
  if (existing) for (const c of existing.clusters) existingById.set(c.id, c);

  // Pre-compute IDs and figure out which clusters are new (need LLM)
  const clusterIds = trimmed.map((c) => {
    const seed = c.articles
      .map((a) => a.guid)
      .sort()
      .join("|");
    return id(seed);
  });

  const needSummary: number[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (!existingById.has(clusterIds[i])) needSummary.push(i);
  }

  console.log(
    `[run] ${needSummary.length} clusters need new summaries, ${trimmed.length - needSummary.length} reused`,
  );

  // Only summarize the new ones
  const toSummarize = needSummary.map((idx) => trimmed[idx]);
  const summaries = await summarizeClusters(toSummarize, process.env.GROQ_API_KEY);

  const finalClusters: NewsCluster[] = trimmed.map((c, i) => {
    const cid = clusterIds[i];
    const reused = existingById.get(cid);
    if (reused) return reused;

    const newIdx = needSummary.indexOf(i);
    const summary = summaries.get(`c${newIdx}`);
    const headline =
      summary?.headline && summary.headline.length > 0
        ? summary.headline
        : pickCanonicalHeadline(c);
    const summaryText =
      summary?.summary && summary.summary.length > 0
        ? summary.summary
        : c.articles[0].description || c.articles[0].title;

    const sources: NewsSourceLink[] = c.articles.map((a) => ({
      name: a.source.name,
      url: a.link,
      homepage: a.source.homepage,
    }));

    const latest = Math.max(...c.articles.map((a) => Date.parse(a.publishedAt)));
    const sourceCount = sources.length;
    // weight = source_count * recency-decay
    const ageHrs = (Date.now() - latest) / 3_600_000;
    const recency = Math.max(0, 1 - ageHrs / HOURS_BACK);
const weight = Math.min(1, sourceCount * 0.18 + recency * 0.6);

    // First available image across the cluster's articles
    const image_url = c.articles.find((a) => a.image)?.image;

    return {
      id: cid,
      topic: c.topic,
      headline,
      summary: summaryText,
      published_at: new Date(latest).toISOString(),
      sources,
      source_count: sourceCount,
      weight: Number(weight.toFixed(3)),
      ...(image_url ? { image_url } : {}),
    };
  });
  const feed: NewsFeed = {
    generated_at: new Date().toISOString(),
    clusters: finalClusters,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(feed, null, 2) + "\n", "utf-8");
  console.log(`[run] wrote ${OUT_PATH} with ${finalClusters.length} clusters`);
}

main().catch((err) => {
  console.error("[run] fatal:", err);
  process.exit(1);
});
