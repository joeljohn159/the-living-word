# The Living Word — King James Bible

A museum-quality digital Bible experience featuring the King James Version with interactive maps, historical timeline, archaeological evidence, artwork, and biographical profiles of biblical figures. Built with Next.js 14 and styled with a rich, theme-aware design inspired by scholarly and archival aesthetics.

## Key Features

- **Full KJV Bible Reader** — Chapter-by-chapter reading with adjustable font size, reading modes, cross-reference popovers, dictionary tooltips, and a collapsible context panel (sidebar) for notes, evidence, and related content.
- **Interactive Maps** — Leaflet-powered maps of biblical locations with historical context.
- **Historical Timeline** — Visual timeline of major biblical events with artwork thumbnails sourced from Wikimedia Commons.
- **Archaeological Evidence** — Curated gallery of real archaeological artifacts (Dead Sea Scrolls, Tel Dan Stele, Pilate Stone, etc.) with images and descriptions.
- **People Profiles** — Biographical cards for major biblical figures with classic portrait artwork.
- **Artwork Gallery** — Daily featured artwork and a browsable gallery of biblical media.
- **Multi-Theme Support** — Dark, light, and sepia themes with WCAG AA–compliant contrast across all pages.
- **Full-Text Search** — Search across scripture, people, evidence, and more.
- **Reading Plans** — Structured reading plans for guided study.
- **SEO & Performance** — Sitemap, robots.txt, RSS feed, JSON-LD structured data, lazy-loaded images, and custom error/loading pages.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, CSS variables for theming |
| UI Components | Radix UI (Dialog, Tabs, Tooltip), Lucide icons |
| Animation | Framer Motion |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Maps | Leaflet / React-Leaflet |
| State | Zustand |
| Fonts | Cormorant Garamond, Source Sans 3 (Google Fonts) |
| Testing | Vitest, Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Seed the Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

### Database Studio

```bash
npm run db:studio
```

## Project Structure

```
app/
├── bible/[bookSlug]/[chapter]/   # Chapter reader with context panel
├── evidence/                      # Archaeological evidence pages
├── gallery/                       # Artwork gallery
├── maps/                          # Interactive biblical maps
├── people/                        # Biblical figure profiles
├── privacy/                       # Privacy policy
├── reading-plans/                 # Guided reading plans
├── search/                        # Full-text search
├── timeline/                      # Historical timeline
├── about/                         # About page
├── dictionary/                    # Dictionary/lexicon
├── not-found.tsx                  # Custom 404 page
├── error.tsx                      # Custom error page
├── loading.tsx                    # Global loading skeleton
├── layout.tsx                     # Root layout with theme provider
├── sitemap.ts                     # Dynamic sitemap
└── robots.ts                      # Robots config

components/
├── landing/                       # Landing page sections (Hero, BooksGrid, Timeline, etc.)
├── layout/                        # Header, Footer, Sidebar, MobileNav
├── scripture/                     # Bible reader components (ContextPanel, CrossRef, ChapterNav)
├── evidence/                      # Evidence cards and detail views
├── people/                        # People cards and profiles
├── dictionary/                    # Dictionary tooltips
├── maps/                          # Map components
├── shared/                        # Theme provider, keyboard shortcuts
└── ui/                            # Base UI primitives

lib/
├── db/                            # Database connection, schema, queries, seed
├── seo.ts                         # SEO helpers, JSON-LD
├── search.ts                      # Search logic
├── navigation.ts                  # Book/chapter navigation helpers
└── utils.ts                       # Shared utilities

data/
├── bible.db                       # SQLite database
├── kjv.json                       # KJV text data
├── evidence.json                  # Archaeological evidence seed data
├── people.json                    # Biblical figures seed data
├── locations.json                 # Map locations
├── cross-references.json          # Cross-reference data
├── timeline-events.ts             # Timeline event definitions
└── media-references.json          # Artwork and media references

stores/                            # Zustand state stores
hooks/                             # Custom React hooks
drizzle/                           # Generated migration files
```

## Themes

The app supports three themes — **dark**, **light**, and **sepia** — controlled via CSS custom properties in `app/globals.css`. All components use theme-aware variables (`--bg-primary`, `--text-primary`, `--gold`, etc.) to ensure readability and contrast compliance across every mode.

## License

All scripture text is from the King James Version (public domain). Artwork and images are sourced from Wikimedia Commons under public domain or compatible licenses.
