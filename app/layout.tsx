import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { KeyboardShortcutsProvider } from "@/components/shared/KeyboardShortcutsProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, buildWebSiteJsonLd, jsonLdScriptProps } from "@/lib/seo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Living Word — King James Bible with Maps, Art & Evidence",
    template: "%s | The Living Word",
  },
  description:
    "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary. A museum-quality Bible reading experience.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: "The Living Word — King James Bible with Maps, Art & Evidence",
    description:
      "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "The Living Word — King James Bible",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Word — King James Bible with Maps, Art & Evidence",
    description:
      "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* RSS feed for daily verse */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Living Word — Daily Verse"
          href="/feed.xml"
        />
        {/* Preconnect to image CDN for faster LCP */}
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link
          rel="dns-prefetch"
          href="https://upload.wikimedia.org"
        />
        {/* WebSite structured data for search engines */}
        <script {...jsonLdScriptProps(buildWebSiteJsonLd())} />
      </head>
      <body
        className={`${cormorant.variable} ${sourceSans.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <KeyboardShortcutsProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-[var(--bg-primary)] focus:font-source-sans focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            >
              Skip to content
            </a>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </div>
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
