import Groq from "groq-sdk";
import type { Cluster } from "./cluster";

interface SummaryInput {
  id: string;
  topic: string;
  headlines: string[];
  descriptions: string[];
}

interface SummaryOutput {
  id: string;
  same_event: boolean;
  canonical_headline: string;
  summary: string;
}

const MODEL = "llama-3.3-70b-versatile";
const BATCH_SIZE = 3;

function makePrompt(items: SummaryInput[]): string {
  return `You are a senior news editor preparing a daily digest for retail readers.

For each item below, return:
1. same_event: do all the headlines describe the SAME news event (same announcement, same incident, same person doing the same thing)? true or false.
2. canonical_headline: a single clean headline (max 90 chars) that best describes the event. Plain English, no clickbait, no emojis, no source name prefixes.
3. summary: 2 sentences (max 60 words). Synthesize across the headlines + descriptions provided. Plain English, no hype, no emojis.

Output STRICT JSON only — an array of objects with keys: id, same_event, canonical_headline, summary.

Items:
${JSON.stringify(items, null, 2)}`;
}

function safeParseJson(text: string): unknown {
  // Try to find a JSON array in the response
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch {}
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function summarizeClusters(
  clusters: Cluster[],
  apiKey: string | undefined,
): Promise<Map<string, { headline: string; summary: string }>> {
  const out = new Map<string, { headline: string; summary: string }>();

  // Build inputs (only multi-article clusters need cross-source synthesis,
  // but we summarize all for consistency)
  const inputs: SummaryInput[] = clusters.map((c, i) => ({
    id: `c${i}`,
    topic: c.topic,
    headlines: c.articles.map((a) => a.title),
    descriptions: c.articles
      .map((a) => a.description)
      .filter(Boolean)
      .slice(0, 3)
      .map((d) => d.slice(0, 400)),
  }));

  if (!apiKey) {
    console.warn("[summarize] GROQ_API_KEY missing — using RSS-description fallback");
    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      const id = `c${i}`;
      const headline = c.articles[0].title;
      const summary =
        c.articles.find((a) => a.description.length > 80)?.description?.slice(0, 280) ??
        c.articles[0].description ??
        c.articles[0].title;
      out.set(id, { headline, summary });
    }
    return out;
  }

  const groq = new Groq({ apiKey });

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);
    try {
      const resp = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "Output only valid JSON. No prose." },
          { role: "user", content: makePrompt(batch) },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" } as never,
      });
      const text = resp.choices[0]?.message?.content ?? "";
      const parsed = safeParseJson(text);
      const list: SummaryOutput[] = Array.isArray(parsed)
        ? (parsed as SummaryOutput[])
        : Array.isArray((parsed as any)?.results)
        ? ((parsed as any).results as SummaryOutput[])
        : [];

      for (const item of list) {
        if (!item?.id) continue;
        out.set(item.id, {
          headline: item.canonical_headline?.trim() || "",
          summary: item.summary?.trim() || "",
        });
      }
    } catch (err) {
      console.warn(`[summarize] batch ${i} failed:`, (err as Error).message);
    }
    // Light pacing
    await new Promise((r) => setTimeout(r, 250));
  }

  // Fill any holes with fallback
  for (let i = 0; i < clusters.length; i++) {
    const id = `c${i}`;
    if (!out.has(id)) {
      const c = clusters[i];
      const headline = c.articles[0].title;
      const summary =
        c.articles.find((a) => a.description.length > 80)?.description?.slice(0, 280) ??
        c.articles[0].description ??
        c.articles[0].title;
      out.set(id, { headline, summary });
    }
  }

  return out;
}
