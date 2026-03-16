import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingword.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Living Word",
    title: "The Living Word — King James Bible with Maps, Art & Evidence",
    description:
      "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Word — King James Bible with Maps, Art & Evidence",
    description:
      "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary.",
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
