import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
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
        {/* WebSite structured data for search engines */}
        <script {...jsonLdScriptProps(buildWebSiteJsonLd())} />
      </head>
      <body
        className={`${cormorant.variable} ${sourceSans.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
