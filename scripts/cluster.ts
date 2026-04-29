import type { RawArticle } from "./fetch";

export interface Cluster {
  topic: RawArticle["topic"];
  articles: RawArticle[];
}

const STOP = new Set([
  "the","a","an","is","are","was","were","be","been","being","of","to","in","on","for","at","by","with","and","or","but","not","as","it","this","that","these","those","from","into","over","after","before","up","down","out","off","than","then","so","if","while","about","new","says","said","report","reports","report's","amid","via","you","your","we","our","i","me","my","he","him","his","she","her","they","them","their","its","also","just","more","most","very","one","two","three","four","five","like","could","should","would","may","might","can","will","has","have","had","do","does","did","what","which","who","when","where","why","how"
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function shingle2(tokens: string[]): Set<string> {
  const set = new Set<string>();
  for (const t of tokens) set.add(t);
  for (let i = 0; i < tokens.length - 1; i++) set.add(`${tokens[i]} ${tokens[i + 1]}`);
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return inter / union;
}

const SIM_THRESHOLD = 0.42;

/**
 * Greedy clustering on title + entity overlap.
 * Only clusters articles within the same topic to avoid odd cross-topic merges.
 */
export function clusterArticles(articles: RawArticle[]): Cluster[] {
  // Group by topic first
  const byTopic = new Map<RawArticle["topic"], RawArticle[]>();
  for (const a of articles) {
    if (!byTopic.has(a.topic)) byTopic.set(a.topic, []);
    byTopic.get(a.topic)!.push(a);
  }

  const out: Cluster[] = [];

  for (const [topic, list] of byTopic) {
    // Pre-compute shingles per article
    const shingles = list.map((a) => shingle2(tokenize(a.title)));
    const used = new Array(list.length).fill(false);

    // Order by recency (newest first) so the canonical article tends to be the freshest
    const order = list
      .map((_, i) => i)
      .sort((a, b) =>
        Date.parse(list[b].publishedAt) - Date.parse(list[a].publishedAt),
      );

    for (const i of order) {
      if (used[i]) continue;
      used[i] = true;
      const cluster: Cluster = { topic, articles: [list[i]] };
      for (const j of order) {
        if (used[j] || j === i) continue;
        const sim = jaccard(shingles[i], shingles[j]);
        if (sim >= SIM_THRESHOLD) {
          used[j] = true;
          cluster.articles.push(list[j]);
        }
      }
      out.push(cluster);
    }
  }

  // Dedupe inside clusters by source — keep first per source
  for (const c of out) {
    const seen = new Set<string>();
    c.articles = c.articles.filter((a) => {
      if (seen.has(a.source.id)) return false;
      seen.add(a.source.id);
      return true;
    });
  }

  return out;
}

export function pickCanonicalHeadline(c: Cluster): string {
  // Prefer the most "canonical" headline: shortest non-truncated title from a major source
  const sorted = [...c.articles].sort((a, b) => a.title.length - b.title.length);
  return sorted[0].title;
}
