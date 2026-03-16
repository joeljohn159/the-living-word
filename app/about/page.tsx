import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Palette,
  Map,
  ShieldCheck,
  BookA,
  Link2,
  Keyboard,
  Eye,
  Sun,
  Maximize2,
  Rss,
} from "lucide-react";
import { generatePageMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { DataSourceCard } from "@/components/about/DataSourceCard";
import { TechCard } from "@/components/about/TechCard";

export const metadata: Metadata = generatePageMetadata({
  title: "About",
  description:
    "Learn about The Living Word — a museum-quality King James Bible experience with historical art, archaeological evidence, interactive maps, and an archaic word dictionary. Open source credits and attribution.",
  path: "/about",
});

const DATA_SOURCES = [
  {
    icon: BookOpen,
    title: "Scripture Text",
    description:
      "The King James Version (1769 Oxford edition) — the most widely published English translation of the Bible.",
    attribution: "Public domain",
  },
  {
    icon: Palette,
    title: "Artwork",
    description:
      "Classical paintings and illustrations by masters including Michelangelo, Rembrandt, Caravaggio, and Doré.",
    attribution: "Wikimedia Commons — public domain",
  },
  {
    icon: Map,
    title: "Maps",
    description:
      "Interactive maps of biblical locations, journeys, and events rendered with geographic accuracy.",
    attribution: "OpenStreetMap contributors (ODbL) + Leaflet",
  },
  {
    icon: ShieldCheck,
    title: "Archaeological Evidence",
    description:
      "Curated artifacts, manuscripts, and archaeological discoveries that illuminate the biblical narrative.",
    attribution: "Public sources — individually attributed",
  },
  {
    icon: BookA,
    title: "Dictionary",
    description:
      "Definitions for archaic and biblical terms found in the KJV, compiled from established reference works.",
    attribution: "Public reference sources",
  },
  {
    icon: Link2,
    title: "Cross-References",
    description:
      "Thematic and parallel verse connections based on the Treasury of Scripture Knowledge.",
    attribution: "Public domain (19th century)",
  },
];

const TECH_STACK = [
  { name: "Next.js", role: "React framework" },
  { name: "Tailwind CSS", role: "Utility-first styling" },
  { name: "SQLite", role: "Embedded database" },
  { name: "Drizzle ORM", role: "Type-safe queries" },
  { name: "Leaflet", role: "Interactive maps" },
  { name: "Radix UI", role: "Accessible primitives" },
  { name: "Framer Motion", role: "Animations" },
  { name: "Zustand", role: "State management" },
  { name: "Lucide", role: "Icon library" },
  { name: "TypeScript", role: "Type safety" },
];

const ACCESSIBILITY_FEATURES = [
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description: "Full keyboard support with shortcuts — T for theme, D for dictionary, Ctrl+K for search.",
  },
  {
    icon: Eye,
    title: "Screen Reader Friendly",
    description: "Semantic HTML, ARIA labels, and structured headings for assistive technologies.",
  },
  {
    icon: Sun,
    title: "Three Reading Themes",
    description: "Dark, light, and sepia themes designed for comfortable reading in any environment.",
  },
  {
    icon: Maximize2,
    title: "Touch-Friendly Targets",
    description: "Minimum 44px touch targets and swipe navigation for mobile devices.",
  },
];

export default function AboutPage() {
  return (
    <article className="pb-16">
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ])
        )}
      />

      {/* Hero Banner */}
      <header className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="font-source-sans text-xs uppercase tracking-[0.3em] text-gold mb-3">
            About
          </p>
          <h1 className="heading text-3xl sm:text-4xl md:text-5xl text-gold mb-4">
            About The Living Word
          </h1>
          <p className="font-source-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A museum-quality King James Bible experience, illuminated with
            historical art, archaeological evidence, and interactive maps.
          </p>
          <div
            className="mx-auto mt-6 h-px w-24 bg-gold/40"
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Mission Statement */}
      <section
        className="border-b border-border py-12 sm:py-16"
        aria-labelledby="mission-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            id="mission-heading"
            className="heading text-2xl sm:text-3xl text-gold mb-6"
          >
            Our Mission
          </h2>
          <div className="space-y-4 font-source-sans text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              The Living Word was created to make the timeless scripture of the
              King James Bible more accessible, contextual, and alive. We believe
              that reading scripture is enriched when you can see the lands it
              describes, the artifacts that confirm its history, and the art it
              has inspired across centuries.
            </p>
            <p>
              Every chapter is accompanied by four pillars of context:{" "}
              <span className="text-foreground font-medium">historical artwork</span>{" "}
              from the masters,{" "}
              <span className="text-foreground font-medium">interactive maps</span>{" "}
              of biblical locations,{" "}
              <span className="text-foreground font-medium">archaeological evidence</span>{" "}
              that illuminates the text, and a built-in{" "}
              <span className="text-foreground font-medium">archaic word dictionary</span>{" "}
              that makes the beautiful KJV language understandable to modern readers.
            </p>
            <p>
              This is a free, open resource built with care and reverence for the
              text. No ads, no tracking, no paywalls — just scripture,
              beautifully presented.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources & Attribution */}
      <section
        className="border-b border-border py-12 sm:py-16"
        aria-labelledby="sources-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            id="sources-heading"
            className="heading text-2xl sm:text-3xl text-gold mb-8"
          >
            Data Sources &amp; Attribution
          </h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            role="list"
          >
            {DATA_SOURCES.map((source) => (
              <DataSourceCard key={source.title} {...source} />
            ))}
          </div>
        </div>
      </section>

      {/* Attribution Policy */}
      <section
        className="border-b border-border py-12 sm:py-16"
        aria-labelledby="policy-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            id="policy-heading"
            className="heading text-2xl sm:text-3xl text-gold mb-6"
          >
            Attribution Policy
          </h2>
          <div className="space-y-4 font-source-sans text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              All content on The Living Word respects public domain and open
              licensing. The King James Version text has been in the public
              domain for centuries. Artwork is sourced exclusively from Wikimedia
              Commons under public domain or Creative Commons Zero (CC0) licenses.
            </p>
            <p>
              Map tiles are provided by OpenStreetMap contributors under the Open
              Data Commons Open Database License (ODbL). Archaeological evidence
              descriptions are compiled from public academic and museum sources,
              with individual attribution provided where applicable.
            </p>
            <p>
              If you believe any content requires correction or additional
              attribution, please open an issue on our GitHub repository. We take
              proper attribution seriously and will address concerns promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Open Source Credits */}
      <section
        className="border-b border-border py-12 sm:py-16"
        aria-labelledby="tech-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            id="tech-heading"
            className="heading text-2xl sm:text-3xl text-gold mb-8"
          >
            Built With
          </h2>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
            role="list"
          >
            {TECH_STACK.map((tech) => (
              <TechCard key={tech.name} {...tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Statement */}
      <section
        className="border-b border-border py-12 sm:py-16"
        aria-labelledby="a11y-heading"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2
            id="a11y-heading"
            className="heading text-2xl sm:text-3xl text-gold mb-4"
          >
            Accessibility
          </h2>
          <p className="font-source-sans text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            The Living Word is committed to WCAG AA compliance. Scripture should
            be accessible to everyone, regardless of ability or device.
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            role="list"
          >
            {ACCESSIBILITY_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-5"
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  <feature.icon
                    className="h-5 w-5 text-gold mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-source-sans font-semibold text-foreground text-sm">
                      {feature.title}
                    </h3>
                    <p className="font-source-sans text-sm text-muted-foreground mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 sm:py-16 text-center" aria-label="Call to action">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="heading text-2xl sm:text-3xl text-gold mb-4">
            Begin Your Journey
          </h2>
          <p className="font-source-sans text-muted-foreground mb-8 max-w-lg mx-auto">
            Explore the King James Bible with historical context, beautiful art,
            and interactive maps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/bible"
              className="inline-flex items-center gap-2 bg-gold text-[var(--bg-primary)] px-8 py-3.5 rounded-lg font-source-sans font-semibold text-base hover:bg-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background touch-target"
              aria-label="Start reading the Bible"
            >
              Start Reading &rarr;
            </Link>
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-source-sans text-sm text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background touch-target"
              aria-label="Subscribe to daily verse RSS feed"
            >
              <Rss className="h-4 w-4" aria-hidden="true" />
              Daily Verse RSS Feed
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
