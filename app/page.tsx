import newsData from "@/data/news.json";
import type { NewsFeed } from "@/lib/types";
import { DigestApp } from "@/components/DigestApp";

export default function Page() {
  const feed = newsData as NewsFeed;
  return <DigestApp feed={feed} />;
}
