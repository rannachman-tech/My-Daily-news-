# Daily Digest

A free, fast, retail-friendly news aggregator. One page. Rotating top-stories hero. Topic filters. AI summaries that merge duplicate coverage across outlets so one event becomes one card with every source linked.

Same visual language as `btc-cycle-compass` — restrained, high-end, light + dark.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind**
- **Vercel** for hosting (free Hobby tier)
- **GitHub Actions** cron, every 2 hours, fetches RSS → clusters → summarizes → commits `data/news.json`
- **Groq** free tier for AI summaries (Llama 3.3 70B); falls back to RSS descriptions if the key isn't set
- **localStorage** for prefs — no backend, no DB, no accounts

Total monthly cost at retail-scale traffic: **$0**.

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The page reads `data/news.json` (committed to the repo). Seed data ships with the project so you see the full UI on first run.

To regenerate the feed locally:

```bash
GROQ_API_KEY=gsk_xxx npm run fetch
```

If you skip the API key, the script still runs and uses RSS descriptions for summaries.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo → accept defaults → Deploy.
3. Done. You get a `.vercel.app` URL. Custom domain later if you want.

No env vars are needed in Vercel itself — the page is fully static and reads `data/news.json` at build time.

---

## Wire the cron

The cron runs in **GitHub Actions**, not Vercel. It commits the updated `data/news.json` back to the repo, which triggers a Vercel auto-deploy.

1. Get a free Groq API key at https://console.groq.com/keys.
2. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `GROQ_API_KEY`
   - Value: your key
3. Done. The workflow at `.github/workflows/update-news.yml` will run every 2 hours.
4. To test it now: **Actions** tab → **Update news feed** → **Run workflow**.

### Free-tier headroom

| Service | Limit | Our usage |
|---|---|---|
| GitHub Actions | 2,000 min/mo (private) / unlimited (public) | ~5 min/run × 12/day = ~150/mo |
| Groq free | ~14k req/day | ~50/run × 12/day = ~600/day |
| Vercel Hobby | 100 GB bandwidth/mo | static JSON — negligible |

Public repo = literally unmetered cron. Private repo = ~7% of free tier used.

---

## Project layout

```
app/                  # Next.js App Router
  layout.tsx          # Root layout, theme bootstrap script
  page.tsx            # Reads data/news.json, renders DigestApp
  globals.css         # Theme tokens (light + dark), shimmer
components/
  DigestApp.tsx       # Top-level client component, holds prefs state
  Header.tsx          # Sticky top bar
  Hero.tsx            # Auto-rotating top-5 carousel
  TopicFilter.tsx     # Topic pill multi-select
  NewsCard.tsx        # Card for the grid
  SourcePills.tsx     # Multi-source link cluster
  ThemeToggle.tsx     # System / light / dark toggle
  Footer.tsx          # Source list, last updated
lib/
  types.ts            # Shared types (NewsCluster, Source, etc.)
  topics.ts           # Topic registry
  sources.ts          # RSS feed registry (~25 sources)
  time.ts             # timeAgo, withinWindow, formatLocalDate
  storage.ts          # localStorage prefs
data/
  news.json           # The feed (rewritten by the cron)
scripts/
  fetch.ts            # RSS → RawArticle[]
  cluster.ts          # Token-based same-event clustering
  summarize.ts        # Groq summarization with fallback
  run.ts              # Orchestrator (entry point for `npm run fetch`)
.github/workflows/
  update-news.yml     # Cron: every 2h, commit news.json
```

---

## How clustering works

The "OpenAI ships GPT-5.5 across 5 outlets → one card with 5 source pills" guarantee is delivered by `scripts/cluster.ts`:

1. Group articles by topic (we don't merge across topics).
2. Tokenize each headline (lowercased, stopwords stripped).
3. Compute Jaccard similarity over unigrams + bigrams (shingles) between every pair.
4. Greedy merge: any two articles with similarity ≥ 0.42 join the same cluster.
5. Within a cluster, dedupe by source (keep first occurrence per outlet).
6. Pick a canonical headline (currently: shortest title — easy to swap for an LLM choice later).
7. Run **one** Groq summarization per cluster, synthesizing across all the source headlines.

Trade-offs: the Jaccard threshold is tuned conservatively. If you see unrelated stories getting merged, raise to 0.5. If you see duplicate cards for the same event, drop to 0.35.

---

## Adjustable knobs

| Where | Knob | Default |
|---|---|---|
| `scripts/run.ts` | `HOURS_BACK` (look-back window) | 24 |
| `scripts/run.ts` | `MAX_CLUSTERS` (cards in JSON) | 60 |
| `scripts/cluster.ts` | `SIM_THRESHOLD` (clustering aggressiveness) | 0.42 |
| `components/Hero.tsx` | `ROTATE_MS` (hero rotation speed) | 6000 |
| `.github/workflows/update-news.yml` | `cron` schedule | every 2h |

---

## License

MIT. Headlines and links belong to their respective publishers. This app is a directory of links to free public RSS feeds — no content is republished.
