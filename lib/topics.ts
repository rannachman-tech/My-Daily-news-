import type { Topic, TopicId } from "./types";

export const TOPICS: Topic[] = [
  { id: "ai", label: "AI & Tech", shortLabel: "AI" },
  { id: "finance", label: "Finance & Markets", shortLabel: "Finance" },
  { id: "crypto", label: "Crypto", shortLabel: "Crypto" },
  { id: "politics", label: "Politics", shortLabel: "Politics" },
  { id: "business", label: "Business", shortLabel: "Business" },
  { id: "science", label: "Science", shortLabel: "Science" },
];

export const TOPIC_BY_ID: Record<TopicId, Topic> = TOPICS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TopicId, Topic>,
);

export const ALL_TOPIC_IDS: TopicId[] = TOPICS.map((t) => t.id);
