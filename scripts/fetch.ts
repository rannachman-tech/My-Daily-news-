import Parser from "rss-parser";
import { SOURCES } from "../lib/sources";
import type { Source, TopicId } from "../lib/types";

/** Tiny concurrency limiter — replaces p-limit (ESM-only, breaks tsx). */
function pLimit(concurrency: number) {
  const queue: Array<() => void> = [];
  let active = 0;
  const next = () => {
    active--;
    if (queue.length > 0) queue.shift()!();
  };
  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(resolve, reject).finally(next);
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
}

export interface RawArticle {
  source: Source;
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  topic: TopicId;
  guid: string;
  image?: string;
}

const parser: Parser<{}, any> = new Parser({
  timeout: 12_000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; DailyDigestBot/1.0; +https://github.com/)",
  },
  customFields: {
    item: [
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["media:content", "media:content", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

function canonicalizeUrl(input: string): string {
  try {
    const u = new URL(input);
    const drop = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","ref","ref_src","fbclid","gclid","mc_cid","mc_eid"];
    drop.forEach((k) => u.searchParams.delete(k));
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return input;
  }
}

function parseDate(d: string | undefined): string {
  if (!d) return new Date().toISOString();
  const t = Date.parse(d);
  if (Number.isNaN(t)) return new Date().toISOString();
  return new Date(t).toISOString();
}

function stripHtml(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function isImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url) || /^https?:\/\//i.test(url);
}

function extractImage(item: any): string | undefined {
  const thumb = item["media:thumbnail"];
  if (thumb) {
    const url = thumb?.$?.url ?? thumb?.url ?? (typeof thumb === "string" ? thumb : undefined);
    if (url && isImageUrl(url)) return url;
  }
  const mc = item["media:content"];
  if (Array.isArray(mc)) {
    const imageOne = mc.find((m: any) => {
      const medium = m?.$?.medium;
      const type = m?.$?.type;
      return medium === "image" || (typeof type === "string" && type.startsWith("image"));
    });
    const url = imageOne?.$?.url ?? mc[0]?.$?.url;
    if (url && isImageUrl(url)) return url;
  } else if (mc?.$?.url && isImageUrl(mc.$.url)) {
    return mc.$.url;
  }
  const enc = item.enclosure;
  if (enc?.url) {
    const t = (enc.type as string | undefined) ?? "";
    if (t.startsWith("image") || /\.(jpg|jpeg|png|webp|gif|avif)/i.test(enc.url)) {
      return enc.url;
    }
  }
  const html: string = item.contentEncoded ?? item.content ?? item.summary ?? "";
  if (typeof html === "string") {
    const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (m && isImageUrl(m[1])) return m[1];
  }
  return undefined;
}

async function fetchOne(source: Source, hoursBack: number): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.feed);
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const items = (feed.items ?? []) as any[];
    const articles: RawArticle[] = [];
    for (const item of items) {
      const link = canonicalizeUrl(item.link ?? item.guid ?? "");
      if (!link || !item.title) continue;
      const publishedAt = parseDate(item.isoDate ?? item.pubDate);
      if (Date.parse(publishedAt) < cutoff) continue;
      articles.push({
        source,
        title: stripHtml(item.title),
        link,
        description: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? ""),
        publishedAt,
        topic: source.topic,
        guid: link,
        image: extractImage(item),
      });
    }
    return articles;
  } catch (err) {
    console.warn(`[fetch] ${source.name} failed:`, (err as Error).message);
    return [];
  }
}

export async function fetchAll(hoursBack = 24): Promise<RawArticle[]> {
  const limit = pLimit(6);
  const results = await Promise.all(SOURCES.map((s) => limit(() => fetchOne(s, hoursBack))));
  const flat = results.flat();
  console.log(`[fetch] ${flat.length} articles from ${SOURCES.length} sources (${flat.filter((a) => a.image).length} with images)`);
  return flat;
}
