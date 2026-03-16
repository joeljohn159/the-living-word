/**
 * About Page — Design Specification
 * ══════════════════════════════════
 *
 * Route: /about
 * Type: Static page (no dynamic data fetching)
 * Layout: Single-column prose with section dividers
 *
 * ─── SECTIONS ────────────────────────────────────────────────
 *
 * 1. HERO BANNER
 *    - Compact page header (not full-viewport like homepage)
 *    - Title: "About The Living Word" in heading/cormorant style
 *    - Subtitle: "A museum-quality King James Bible experience"
 *    - Gold accent divider below
 *
 * 2. MISSION STATEMENT
 *    - Section heading: "Our Mission"
 *    - 2-3 paragraphs explaining the project's purpose
 *    - Emphasis on making scripture accessible with rich context
 *    - Mention: art, maps, evidence, dictionary — the four pillars
 *
 * 3. DATA SOURCES & ATTRIBUTION
 *    - Section heading: "Data Sources & Attribution"
 *    - Card grid (2 columns on desktop, 1 on mobile)
 *    - Cards for each data source:
 *      a) Scripture Text — KJV (public domain, 1769 Oxford edition)
 *      b) Artwork — Wikimedia Commons (public domain paintings)
 *      c) Maps — OpenStreetMap + Leaflet (OSM attribution)
 *      d) Archaeological Evidence — curated from public sources
 *      e) Dictionary — archaic word definitions compiled from public reference
 *      f) Cross-references — Treasury of Scripture Knowledge (public domain)
 *    - Each card: icon, title, description, license/attribution note
 *
 * 4. ATTRIBUTION POLICY
 *    - Section heading: "Attribution Policy"
 *    - Explain that all content respects public domain / open licenses
 *    - KJV text is public domain
 *    - Art images sourced from Wikimedia (CC0 / public domain)
 *    - Map tiles from OpenStreetMap contributors (ODbL)
 *    - If any content needs correction, provide contact method
 *
 * 5. OPEN SOURCE CREDITS
 *    - Section heading: "Built With"
 *    - Grid of technology cards (3 columns desktop, 2 tablet, 1 mobile)
 *    - Technologies:
 *      - Next.js (React framework)
 *      - Tailwind CSS (styling)
 *      - SQLite + Drizzle ORM (database)
 *      - Leaflet (maps)
 *      - Radix UI (accessible primitives)
 *      - Framer Motion (animations)
 *      - Lucide (icons)
 *      - Zustand (state management)
 *    - Each shows name + brief role
 *
 * 6. ACCESSIBILITY STATEMENT
 *    - Section heading: "Accessibility"
 *    - WCAG AA compliance commitment
 *    - Keyboard navigation support
 *    - Screen reader friendly
 *    - Three reading themes (dark, light, sepia)
 *    - Adjustable font sizes
 *    - Touch-friendly targets (44px minimum)
 *
 * 7. FOOTER CTA
 *    - "Start Reading" button linking to /bible
 *    - RSS feed link for daily verse
 *
 * ─── VISUAL STYLE ────────────────────────────────────────────
 *
 * - Background: bg-background (theme-aware)
 * - Cards: bg-card with border-border, rounded-lg
 * - Section spacing: py-12 sm:py-16 with border-b border-border dividers
 * - Headings: heading class (Cormorant Garamond), text-gold
 * - Body text: font-source-sans, text-foreground / text-muted-foreground
 * - Gold accents on icons and highlights
 * - Max width: max-w-4xl mx-auto for readability
 * - Mobile-first responsive grid
 *
 * ─── SEO ─────────────────────────────────────────────────────
 *
 * - Title: "About" (uses template: "About | The Living Word")
 * - Description: about the project, data sources, open source
 * - Canonical: /about
 * - JSON-LD: BreadcrumbList (Home → About)
 *
 * ─── ACCESSIBILITY ───────────────────────────────────────────
 *
 * - Semantic HTML: <article>, <section>, <h1>-<h3>
 * - All sections have aria-labelledby pointing to their heading
 * - Card grid uses role="list" with role="listitem"
 * - Links have descriptive text (not "click here")
 * - Focus visible outlines on all interactive elements
 * - Skip-to-content compatible (main landmark)
 */

export default {};
