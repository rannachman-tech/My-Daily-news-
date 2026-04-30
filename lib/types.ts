export type TopicId = "ai" | "finance" | "crypto" | "politics" | "business" | "science";

export interface Topic {
  id: TopicId;
  label: string;
  shortLabel: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  feed: string;
  topic: TopicId;
  homepage: string;
}

export interface NewsSourceLink {
  name: string;
  url: string;
  homepage: string;
}

export interface NewsCluster {
  id: string;
  topic: TopicId;
  headline: string;
  summary: string;
  published_at: string; // ISO 8601 UTC
  sources: NewsSourceLink[];
  source_count: number;
  weight: number;
    /** Optional featured image URL extracted from RSS feeds. */
  image_url?: string;
}

export interface NewsFeed {
  generated_at: string; // ISO 8601 UTC
  clusters: NewsCluster[];
}

export type ThemeMode = "light" | "dark";

export type TimeWindow = "12h" | "24h" | "week";
