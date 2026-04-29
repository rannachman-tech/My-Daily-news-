import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Digest — Your morning news, in one place",
  description:
    "A clean, free daily news digest aggregating AI, finance, crypto, politics, business, and science from the world's best free sources.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

// Inline script that sets the theme class before paint to avoid FOUC.
const themeScript = `
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('daily-news-prefs:v1') || '{}');
    var mode = prefs.theme || 'system';
    var resolved = mode;
    if (mode === 'system' || !mode) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
