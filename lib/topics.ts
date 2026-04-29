import type { Topic, TopicId } from "./types";

export const TOPICS: (Topic & { hue: string; hueLight: string })[] = [
  { id: "ai", label: "AI & Tech", shortLabel: "AI", hue: "#22D3EE", hueLight: "#0891B2" },
  { id: "finance", label: "Finance", shortLabel: "Finance", hue: "#34D399", hueLight: "#059669" },
  { id: "crypto", label: "Crypto", shortLabel: "Crypto", hue: "#FBBF24", hueLight: "#B45309" },
  { id: "politics", label: "Politics", shortLabel: "Politics", hue: "#FB7185", hueLight: "#BE123C" },
  { id: "business", label: "Business", shortLabel: "Business", hue: "#A78BFA", hueLight: "#6D28D9" },
  { id: "science", label: "Science", shortLabel: "Science", hue: "#5EEAD4", hueLight: "#0F766E" },
];

export const TOPIC_BY_ID: Record<TopicId, (typeof TOPICS)[number]> = TOPICS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TopicId, (typeof TOPICS)[number]>,
);

export const ALL_TOPIC_IDS: TopicId[] = TOPICS.map((t) => t.id);
