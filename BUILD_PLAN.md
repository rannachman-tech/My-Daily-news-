# Daily News Digest — Build Plan

A free, fast, retail-friendly news aggregator. One page. Auto-refreshed overnight. Topic filters. Same clean visual language as `btc-cycle-compass`.

---

## 1. Decisions locked in

| Area | Choice |
|---|---|
| Topics | AI & Tech · Finance & Markets · Crypto · Politics + Business + Science |
| Fetch model | Server cron → cached JSON (no per-visit fetching) |
| Card depth | Headline + AI 2-sentence summary + **multiple source links per card** |
| Dedupe | Cross-source clustering — one event, one card, every outlet linked |
| Hero | Auto-rotating "Top Stories" carousel at the top |
| Theme | Light + dark toggle, high-end aesthetic (Linear / Vercel / Stripe vibe) |
| Timezone | User's local timezone, computed client-side |
| Persistence | localStorage only (no accounts, no backend) |
| Stack | Next.js 14 (App Router) + TypeScript + Tailwind, Vercel hosting |
| Domain | Vercel default subdomain for v1 (custom later) |
| Cron | GitHub Actions (more generous free tier than Vercel cron) |
| Summarizer | Groq free tier (Llama 3.3 70B); Gemini 1.5 Flash as fallback |
| Storage | `public/data/news.json` versioned in repo — no DB |
| Cost | $0/mo at retail-scale traffic. Hard requirement, not a goal. |

---

## 2. Architecture

```
   ┌──────────────────────────────┐
   │  GitHub Actions cron (q2h)   │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │  Node fetcher script         │
   │   • parse RSS in parallel    │
   │   • canonicalize URLs        │
   │   • cluster same event       │
   │     across sources           │
   │   • Groq summarize cluster   │
   │   • rank by source count +   │
   │     recency for hero         │
   │   • write news.json          │
   └──────────────┬───────────────┘
                  │ git commit + push
                  ▼
   ┌──────────────────────────────┐
   │  Vercel auto-deploy          │
   └──────────────┬───────────────┘
                  │
                  ▼
   ┌──────────────────────────────┐
   │  User opens page             │
   │   • reads news.json (static) │
   │   • filters by localStorage  │
   │   • renders cards            │
   └──────────────────────────────┘
```

Why this is the right shape: zero compute on page-load (every request is a CDN-cached static read), zero database, and the cron lives outside Vercel's hobby limits. The whole stack costs $0 indefinitely.

---

## 3. Sources (free, retail-grade)

**AI & Tech**
- TechCrunch — `https://techcrunch.com/feed/`
- The Verge — `https://www.theverge.com/rss/index.xml`
- Hacker News (front page) — `https://hnrss.org/frontpage`
- Ars Technica — `https://feeds.arstechnica.com/arstechnica/index`
- MIT Technology Review — `https://www.technologyreview.com/feed/`

**Finance & Markets**
- Yahoo Finance — `https://finance.yahoo.com/news/rssindex`
- MarketWatch top stories — `http://feeds.marketwatch.com/marketwatch/topstories/`
- CNBC top news — `https://www.cnbc.com/id/100003114/device/rss/rss.html`
- Investing.com — `https://www.investing.com/rss/news.rss`
- Reuters Business (via RSSHub mirror if needed)

**Crypto**
- CoinDesk — `https://www.coindesk.com/arc/outboundfeeds/rss/`
- The Block — `https://www.theblock.co/rss.xml`
- Decrypt — `https://decrypt.co/feed`
- Bitcoin Magazine — `https://bitcoinmagazine.com/.rss/full/`
- Cointelegraph — `https://cointelegraph.com/rss`

**Politics + Business + Science (bundle)**
- BBC World — `http://feeds.bbci.co.uk/news/world/rss.xml`
- Al Jazeera — `https://www.aljazeera.com/xml/rss/all.xml`
- AP News (via RSSHub)
- ScienceDaily top — `https://www.sciencedaily.com/rss/top.xml`
- Nature — `https://www.nature.com/nature.rss`
- Bloomberg / WSJ headlines via Google News RSS query

Each source gets a `topic` tag in the fetcher config so the UI can filter cleanly.

---

## 4. "Last night" window logic

Default: stories published between **yesterday 18:00** and **today 09:00** in the user's local timezone.
Filter is computed client-side from `published_at` so the same JSON serves every timezone. UI offers Last 12h / Last 24h / This week toggles.

---

## 5. Cross-source clustering (the "one event, one card" rule)

The most important quality signal in a retail news app: when 5 outlets cover "OpenAI ships GPT-5.5", the user sees **one card** with **five source pills**, not five duplicate cards. Pipeline:

**Step A — first-pass clustering (cheap, deterministic)**
For every story in the last 24h:
1. Strip the headline to a normalized form (lowercase, remove stopwords, remove the source prefix like "Reuters: ").
2. Take the set of meaningful tokens + 2-grams.
3. Compute Jaccard similarity against every other story.
4. If similarity > 0.55 OR shared named entities ≥ 2 → mark as candidate cluster.

This catches the obvious overlaps for free, no LLM needed.

**Step B — second-pass verification (LLM, batched)**
For each candidate cluster, send the headlines to Groq with a strict prompt:
> "Here are N headlines. Return JSON: are they about the **same news event** (same announcement, same incident, same person doing the same thing)? `{same_event: true|false, canonical_headline: "..." }`."

Groq's free tier handles this in milliseconds per cluster. False positives drop to near zero.

**Step C — cluster object**
Each cluster becomes one card object:

```json
{
  "id": "evt_8a91...",
  "topic": "ai",
  "headline": "OpenAI launches GPT-5.5 with multimodal upgrades",
  "summary": "OpenAI today released GPT-5.5...",
  "published_at": "2026-04-29T03:14:00Z",
  "sources": [
    { "name": "TechCrunch", "url": "...", "favicon": "..." },
    { "name": "The Verge", "url": "...", "favicon": "..." },
    { "name": "Reuters",   "url": "...", "favicon": "..." }
  ],
  "source_count": 3,
  "weight": 0.91
}
```

`source_count` and recency drive ranking — stories covered by many outlets float to the hero rotator.

## 5b. AI summarization (free, with fallback)

- Provider: **Groq free tier** — ~30 req/min, ~14k req/day.
- Model: `llama-3.3-70b-versatile`.
- One summary **per cluster**, not per article — so 5 outlets covering the same story = 1 LLM call, not 5.
- Batch 3 clusters per call → JSON response.
- Cache by cluster id; reruns of the cron don't re-summarize.
- Prompt: "Summarize this news for a retail reader in 2 sentences. Plain English. No hype. No emojis. Synthesize across the source headlines provided."
- Fallback chain: Groq → Gemini 1.5 Flash → longest RSS description across the cluster.

---

## 6. UI / UX

Reference points for "high-end": Linear, Vercel marketing, Stripe docs, `btc-cycle-compass`. Restrained color, fine 1px borders, generous whitespace, refined type (Geist or Inter), tasteful micro-interactions. No drop shadows, no gradient toys, no busy iconography.

### Top to bottom

**1. Top bar (sticky)**
- App wordmark, today's date in user-local TZ, "updated HH:MM" pill, theme toggle (sun/moon icon).
- Translucent background with `backdrop-blur` so content gently shows through on scroll.

**2. Hero rotator (the rolling news section you described)**
- Full-width strip, ~280–320px tall.
- Auto-advances every **6 seconds** between the top 5 stories of the last 24h (ranked by `source_count` × recency).
- Smooth horizontal slide transition with easing — not a hard cut.
- Pause on hover, pause on focus, pause when tab is hidden.
- Dot indicators below + left/right arrow controls on hover.
- Each slide shows: large headline, 1-line summary, source pill cluster, "Read on [primary source] →".
- Keyboard: ←/→ to navigate, Space to pause/resume.
- Respects `prefers-reduced-motion` → fades instead of slides.

**3. Topic filter strip**
- Pills: All · AI · Finance · Crypto · Politics · Business · Science.
- Multi-select. Active state = filled pill in accent color. Persisted in localStorage.

**4. Card grid**
- 3 cols desktop, 2 cols tablet, 1 col mobile.
- Each card:
  - Topic tag (small, top-left)
  - Time-ago ("3h ago", top-right)
  - Headline (large, weight 600)
  - 2-line AI summary
  - **Source pills row**: favicon + name, each one clickable as a separate link. If 4+ sources, show 3 + "+N more" that expands inline.
- Hover: subtle border-color shift, 1px border-width hold (no movement).

**5. Footer**
- Full source list grouped by topic, "last updated HH:MM local", a quiet credit line.

### Theme spec (high-end light + dark)

| Token | Light | Dark |
|---|---|---|
| Background | `#FAFAFA` | `#0A0A0A` |
| Surface (card) | `#FFFFFF` | `#111111` |
| Border | `#E5E5E5` | `#1F1F1F` |
| Text primary | `#0A0A0A` | `#F5F5F5` |
| Text secondary | `#666666` | `#999999` |
| Accent | `#0066FF` | `#3B82F6` |
| Accent (hover) | `#0052CC` | `#60A5FA` |

Typography: Geist Sans (or Inter) for body, Geist Mono for timestamps and metadata. No more than 3 weights in use.

Toggle behavior: respects `prefers-color-scheme` on first visit; once toggled, that choice locks and persists in localStorage.

### States
- Skeleton shimmer on first paint (until `news.json` resolves)
- Stale banner if `news.json` is >6 hours old
- Empty state: "Nothing in {topic} for this window. Try expanding the time range."

### Accessibility
- AA contrast in both themes (color tokens above already pass)
- All interactive elements are real `<button>`s / `<a>`s with proper aria
- Hero rotator pauses on focus, exposes pause/play to screen readers
- Full keyboard nav across cards and pills

---

## 7. localStorage shape

```json
{
  "topics": ["ai", "finance", "crypto"],
  "theme": "dark",
  "window": "last_24h",
  "read_ids": ["hash1", "hash2"]
}
```

`read_ids` powers an optional "hide read" toggle.

---

## 8. Build phases

**Phase 1 — Skeleton (½ day)**
Init Next.js, Tailwind, deploy hello-world to Vercel. Domain wired.

**Phase 2 — Data pipeline (1–2 days)**
- `scripts/fetch.ts`: rss-parser + p-limit, normalize to `{id, title, url, source, topic, published_at, description}`
- URL canonicalization + dedupe by hash
- Groq summarizer with batching + cache
- GitHub Actions workflow runs every 2h, commits `public/data/news.json`

**Phase 3 — UI (2 days)**
- Card, topic filter, theme toggle, time-window toggle
- localStorage hook
- Empty / loading / stale states

**Phase 4 — Polish (½ day)**
- SEO meta + OG image
- Mobile QA across iPhone/Android widths
- Accessibility pass
- Lighthouse → 95+ everywhere

**Phase 5 — Stretch goals (post-v1)**
- "Top story of the day" hero card (LLM-picked across topics)
- Search bar
- Mark-as-read + hide-read toggle
- Per-source mute
- Email or Telegram digest using the same JSON
- PWA / install-to-home-screen

---

## 9. Free-tier ceilings to be aware of

| Service | Limit | Our usage | Headroom |
|---|---|---|---|
| Vercel Hobby | 100 GB bandwidth/mo | ~5 GB at 10k DAU | huge |
| GitHub Actions | 2000 min/mo | ~5 min/day = 150/mo | huge |
| Groq free | ~14k req/day | ~50 req/cron × 12 = 600/day | huge |
| Gemini 1.5 Flash free | 1M tokens/day | only used as fallback | huge |

Nothing here is close to a cliff for retail-scale traffic.

---

## 10. Risks & mitigations

- **RSS feeds change or rate-limit** — every source has 1 backup feed; cron logs failures and continues.
- **Reuters / WSJ shrinking public RSS** — fall back to Google News topic queries.
- **Duplicate stories across sources** — canonicalize URL (strip UTM, lowercase host) and hash; keep the earliest source.
- **Summary quality drift** — sample 5 random summaries weekly; tweak prompt if needed.
- **Source bias** — multiple outlets per topic; no single-source bucket.

---

## 11. Decisions still open before code starts

Resolved:
- ✅ Theme: light + dark toggle, high-end aesthetic, respects `prefers-color-scheme` on first visit
- ✅ Timezone: user-local, computed client-side
- ✅ Domain: Vercel default subdomain for v1
- ✅ Telemetry: not now

Still open:
1. **Brand name + favicon** — placeholder fine for v0, easy to swap later.
2. **Hero rotation speed** — 6s is the default; some readers prefer 8s. Easy to tune.
3. **Cron frequency** — every 2h (recommended) vs. every 1h vs. 4× daily at fixed times.

Once you confirm those (or say "use defaults"), I can scaffold the repo and ship a working v0 inside a day.
