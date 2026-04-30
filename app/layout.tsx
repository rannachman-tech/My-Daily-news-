import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://my-daily-news-one.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Daily Digest — Your morning news, in one place",
    template: "%s · Daily Digest",
  },
  description:
    "A free, fast daily news digest covering AI, finance, crypto, politics, business, and science. Refreshed every two hours.",
  applicationName: "Daily Digest",
  openGraph: {
    title: "Daily Digest",
    description: "Your morning news, in one place.",
    url: "/",
    siteName: "Daily Digest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Digest",
    description: "Your morning news, in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

const themeScript = `
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('daily-news-prefs:v2') || '{}');
    var mode = prefs.theme;
    if (!mode || mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (mode === 'dark') {
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
