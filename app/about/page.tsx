import Link from "next/link";
import type { Metadata } from "next";
import { SOURCES } from "@/lib/sources";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "About",
  description: "What Daily Digest is, how it works, and how your data is handled.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-[11px] font-mono uppercase tracking-wider text-fg-muted hover:text-fg transition-colors mb-8"
      >
        ← Back
      </Link>

      <h1 className="text-[34px] sm:text-[42px] leading-[1.05] font-semibold tracking-[-0.025em] text-fg mb-6">
        About Daily Digest
      </h1>

      <div className="space-y-8 text-[15px] leading-relaxed text-fg-muted">
        <section>
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
            What this is
          </h2>
          <p>
            Daily Digest is a one-page morning news reader. It pulls headlines
            from {SOURCES.length} free, public RSS feeds across {TOPICS.length}{" "}
            topics, clusters duplicate coverage so each event appears as a
            single card with all the original sources linked, and serves the
            result as a single static page.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
            How it works
          </h2>
          <p>
            A scheduled job runs every two hours, fetches the latest articles
            from every source, groups stories that describe the same event, and
            generates a short two-sentence summary for each cluster. The page
            you see is the result of the most recent run.
          </p>
          <p className="mt-3">
            All content links to the original publishers. Daily Digest does not
            republish article bodies and is not affiliated with any of the
            outlets it cites.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
            Privacy
          </h2>
          <p>
            No accounts, no analytics, no third-party trackers. Topic and theme
            preferences are stored in your browser&apos;s localStorage and never
            leave your device. There is no backend that knows you visited.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
            Sources
          </h2>
          <p>
            Headlines come from established free RSS feeds across each topic.
            The full list is in the footer of the home page.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-fg-subtle mb-2">
            Disclaimer
          </h2>
          <p className="text-fg-subtle">
            For informational purposes only. Daily Digest aggregates publicly
            available headlines from third-party publishers and is not
            affiliated with them. Nothing on this site constitutes financial,
            investment, legal, or tax advice.
          </p>
        </section>
      </div>
    </main>
  );
}
