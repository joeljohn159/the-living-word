# 🏗️ MASTER PROMPT: Build "The Living Word" — A World-Class KJV Bible Website

## PROJECT OVERVIEW

Build a production-grade, visually stunning, SEO-optimized Bible website called **"The Living Word"** using **Next.js 14 (App Router)** with the **King James Version** as the initial translation. This will be the most visually rich, historically grounded, and user-friendly Bible reading experience on the internet.

The website must combine scripture reading with real historical images, archaeological evidence, interactive maps, paintings from Wikipedia/Wikimedia Commons, cross-references, a built-in dictionary for archaic KJV words, and a modern museum-quality UI — all fully server-rendered for SEO.

---

## TECH STACK (Use exactly this)

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 with App Router (TypeScript) |
| **Styling** | Tailwind CSS 4 + custom CSS for premium effects |
| **UI Components** | shadcn/ui as the base component library |
| **Database** | SQLite via better-sqlite3 (local, zero-config, fast) |
| **ORM** | Drizzle ORM (type-safe, lightweight) |
| **Maps** | Leaflet.js with OpenStreetMap tiles + custom ancient overlays |
| **Search** | FlexSearch (full-text client-side search, blazing fast) |
| **State Management** | Zustand (lightweight, for reading preferences/bookmarks) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts — "Cormorant Garamond" (display/scripture) + "Source Sans 3" (body/UI) |
| **Image Sources** | Wikimedia Commons API, Wikipedia API, self-hosted optimized images |
| **SEO** | Next.js Metadata API, JSON-LD structured data, sitemap.xml, robots.txt |
| **Analytics** | Vercel Analytics (optional) or Plausible |
| **Deployment** | Vercel or self-hosted Node.js |

---

## DATABASE SCHEMA

Design and seed a SQLite database with these tables:

### Core Scripture Tables

```sql
-- Books of the Bible
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Genesis"
  abbreviation TEXT NOT NULL,            -- "Gen"
  testament TEXT NOT NULL,               -- "OT" or "NT"
  chapter_count INTEGER NOT NULL,
  category TEXT NOT NULL,                -- "Law", "History", "Poetry", "Major Prophets", "Minor Prophets", "Gospels", "Pauline Epistles", "General Epistles", "Apocalyptic"
  description TEXT,                      -- Brief description of the book
  author TEXT,                           -- Traditional author
  date_written TEXT,                     -- Approximate date
  key_themes TEXT,                       -- JSON array of themes
  slug TEXT NOT NULL UNIQUE              -- URL-friendly: "genesis"
);

-- Chapters
CREATE TABLE chapters (
  id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verse_count INTEGER NOT NULL,
  summary TEXT,                          -- Brief chapter summary for SEO
  UNIQUE(book_id, chapter_number)
);

-- Verses (KJV text)
CREATE TABLE verses (
  id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  chapter_id INTEGER REFERENCES chapters(id),
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,                    -- KJV verse text
  UNIQUE(chapter_id, verse_number)
);

-- Future: additional translations
CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,             -- "KJV", "NIV", "ESV"
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE verse_translations (
  id INTEGER PRIMARY KEY,
  verse_id INTEGER REFERENCES verses(id),
  translation_id INTEGER REFERENCES translations(id),
  text TEXT NOT NULL,
  UNIQUE(verse_id, translation_id)
);
```

### Visual & Evidence Tables

```sql
-- Images linked to books/chapters/verses
CREATE TABLE media (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,                    -- "painting", "photograph", "artifact", "map", "illustration", "manuscript"
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,                       -- Original URL (Wikipedia, Wikimedia, etc.)
  image_path TEXT NOT NULL,              -- Local optimized path
  attribution TEXT NOT NULL,             -- "Michelangelo, Sistine Chapel, c. 1512"
  license TEXT,                          -- "Public Domain", "CC BY-SA 4.0"
  source_name TEXT,                      -- "Wikimedia Commons", "British Museum"
  year_created TEXT,                     -- "c. 1512", "1854"
  width INTEGER,
  height INTEGER
);

CREATE TABLE media_references (
  id INTEGER PRIMARY KEY,
  media_id INTEGER REFERENCES media(id),
  book_id INTEGER REFERENCES books(id),
  chapter_id INTEGER REFERENCES chapters(id),
  verse_id INTEGER REFERENCES verses(id),      -- NULL if applies to whole chapter/book
  relevance_score REAL DEFAULT 1.0              -- For ordering
);

-- Archaeological / historical evidence
CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,                          -- "Dead Sea Scrolls"
  description TEXT NOT NULL,
  category TEXT NOT NULL,                       -- "manuscript", "archaeology", "inscription", "artifact", "historical_record"
  date_discovered TEXT,
  location_found TEXT,
  current_location TEXT,                        -- "British Museum, London"
  source_url TEXT,
  image_path TEXT,
  significance TEXT                             -- Why this matters for the Bible
);

CREATE TABLE evidence_references (
  id INTEGER PRIMARY KEY,
  evidence_id INTEGER REFERENCES evidence(id),
  book_id INTEGER REFERENCES books(id),
  chapter_id INTEGER REFERENCES chapters(id),
  verse_id INTEGER REFERENCES verses(id)
);
```

### Maps & Geography Tables

```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Jerusalem"
  modern_name TEXT,                      -- "Al-Quds / Jerusalem"
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  description TEXT,
  type TEXT,                             -- "city", "mountain", "river", "region", "sea"
  image_path TEXT
);

CREATE TABLE location_references (
  id INTEGER PRIMARY KEY,
  location_id INTEGER REFERENCES locations(id),
  book_id INTEGER REFERENCES books(id),
  chapter_id INTEGER REFERENCES chapters(id),
  verse_id INTEGER REFERENCES verses(id)
);

CREATE TABLE journeys (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Exodus Route", "Paul's First Missionary Journey"
  description TEXT,
  color TEXT DEFAULT '#C4975C'           -- Map route color
);

CREATE TABLE journey_stops (
  id INTEGER PRIMARY KEY,
  journey_id INTEGER REFERENCES journeys(id),
  location_id INTEGER REFERENCES locations(id),
  stop_order INTEGER NOT NULL,
  description TEXT,                      -- What happened here
  scripture_ref TEXT                     -- "Acts 13:4-12"
);
```

### Dictionary & Cross-Reference Tables

```sql
-- KJV Archaic Word Dictionary
CREATE TABLE dictionary (
  id INTEGER PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,             -- "begat"
  definition TEXT NOT NULL,              -- "to father; to give birth to"
  modern_equivalent TEXT,                -- "fathered" or "gave birth to"
  part_of_speech TEXT,                   -- "verb", "noun", "adjective"
  pronunciation TEXT,                    -- Phonetic pronunciation
  usage_notes TEXT,                      -- Additional context
  example_verse_id INTEGER REFERENCES verses(id)
);

-- Cross-references between verses
CREATE TABLE cross_references (
  id INTEGER PRIMARY KEY,
  source_verse_id INTEGER REFERENCES verses(id),
  target_verse_id INTEGER REFERENCES verses(id),
  relationship TEXT,                     -- "parallel", "prophecy-fulfillment", "quotation", "allusion", "contrast"
  note TEXT                              -- Brief explanation
);

-- People in the Bible
CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  also_known_as TEXT,                    -- JSON array of alternate names
  description TEXT,
  birth_ref TEXT,                        -- Scripture reference
  death_ref TEXT,
  father_id INTEGER REFERENCES people(id),
  mother_id INTEGER REFERENCES people(id),
  spouse_ids TEXT,                       -- JSON array of people IDs
  tribe_or_group TEXT,
  image_path TEXT
);

CREATE TABLE people_references (
  id INTEGER PRIMARY KEY,
  person_id INTEGER REFERENCES people(id),
  verse_id INTEGER REFERENCES verses(id)
);

-- Reading plans
CREATE TABLE reading_plans (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER,
  plan_data TEXT NOT NULL                -- JSON: [{day: 1, readings: ["Gen 1-2", "Ps 1"]}]
);

-- Bookmarks (stored in localStorage, but schema for future user accounts)
-- User highlights and notes (localStorage for now)
```

---

## SEED DATA REQUIREMENTS

### KJV Text
- Download the full KJV Bible text from a public domain source (e.g., https://github.com/scrollmapper/bible_databases or similar open-source KJV JSON/CSV)
- Parse and insert all 66 books, 1,189 chapters, and 31,102 verses
- Ensure proper encoding of special characters

### Dictionary — Seed at least 300+ archaic KJV words including:
- "abode", "aforetime", "alms", "anon", "asunder", "begat", "behold", "betwixt", "burnished", "chaff", "comely", "concupiscence", "covet", "dearth", "discern", "ere", "exhort", "firmament", "forbear", "gird", "hallow", "hither", "husbandman", "kindred", "longsuffering", "manna", "nigh", "omnipotent", "parable", "prudent", "quicken", "raiment", "remnant", "sabbath", "selah", "sepulchre", "sore", "strait", "sundry", "tabernacle", "thee", "thou", "thine", "thy", "tithe", "transgression", "tribulation", "unto", "usury", "vanity", "verily", "vex", "whence", "wherefore", "whilst", "wist", "woe", "wroth", "yea", "yoke", "zeal"
- Include ALL "thee/thou/thy/thine/ye" forms with grammar explanations
- Add every word that a modern English reader would struggle with

### Cross-References — Seed at least 500+ major cross-references:
- All Old Testament prophecies → New Testament fulfillments
- Parallel accounts (Synoptic Gospels, Kings/Chronicles)
- Key theological connections

### Locations — Seed at least 100+ biblical locations with coordinates:
- Jerusalem, Bethlehem, Nazareth, Egypt, Babylon, Rome, Antioch, Corinth, etc.
- Mountains: Sinai, Ararat, Carmel, Olivet, Zion, Moriah
- Bodies of water: Jordan, Sea of Galilee, Red Sea, Dead Sea, Mediterranean
- Regions: Canaan, Judah, Samaria, Galilee, Mesopotamia

### Journeys — Seed these key routes:
- Abraham's journey from Ur to Canaan
- The Exodus route (Egypt to Promised Land)
- David's flight from Saul
- Paul's 3 missionary journeys + journey to Rome
- Jesus' ministry travels

### People — Seed at least 100+ key biblical figures with family relationships

### Media — Create placeholder references for:
- At least 1-2 paintings/images per book of the Bible
- Famous artworks: Michelangelo, Rembrandt, Doré, Caravaggio, Raphael
- Use Wikimedia Commons URLs as sources
- Archaeological photographs where applicable

### Evidence — Seed at least 50+ items:
- Dead Sea Scrolls, Rosetta Stone, Tel Dan Inscription, Cyrus Cylinder
- Pilate Inscription, James Ossuary, Hezekiah's Tunnel
- Babylonian Chronicles, Moabite Stone, Merneptah Stele
- Ancient manuscripts: Codex Sinaiticus, Codex Vaticanus, etc.

---

## URL STRUCTURE (SEO-Critical)

```
/                                    → Landing page
/bible                               → Full book browser
/bible/[book-slug]                   → Book overview (e.g., /bible/genesis)
/bible/[book-slug]/[chapter]         → Chapter reading (e.g., /bible/genesis/1)
/bible/[book-slug]/[chapter]/[verse] → Single verse with full context (e.g., /bible/genesis/1/1)
/maps                                → Interactive maps hub
/maps/[journey-slug]                 → Specific journey map
/timeline                            → Interactive biblical timeline
/evidence                            → Archaeological evidence gallery
/evidence/[slug]                     → Individual evidence page
/people                              → Biblical people directory
/people/[slug]                       → Person profile with family tree
/dictionary                          → Full dictionary browser
/dictionary/[word]                   → Individual word page
/search                              → Search page
/reading-plans                       → Available reading plans
/about                               → About the project
```

---

## PAGE-BY-PAGE SPECIFICATIONS

### 1. Landing Page (`/`)

**Design:** Museum-quality, dark theme (deep charcoal #1A1A2E with warm gold #C4975C accents). Full-screen hero with a stunning Bible-related painting as background (with tasteful overlay). Think "British Museum meets Apple" — reverent but modern.

**Sections:**
1. **Hero** — Full viewport. Large "Cormorant Garamond" title "The Living Word". Subtitle: "The King James Bible — Illuminated with History, Art, and Evidence". A daily featured verse with beautiful typography. Subtle parallax scroll effect. CTA button "Begin Reading →"
2. **Quick Navigation** — Grid of all 66 books organized by category (Law, History, Poetry, Prophets, Gospels, Epistles, Apocalyptic) with visual cards. Old Testament vs New Testament toggle.
3. **Featured Visual** — A rotating "Artwork of the Day" section showing a famous biblical painting with its context, book/chapter link, and attribution.
4. **Interactive Map Preview** — A mini Leaflet map showing key biblical locations. "Explore the Biblical World →"
5. **Evidence Spotlight** — 3-card carousel of archaeological evidence items with images. "Explore the Evidence →"
6. **Timeline Preview** — Horizontal scrollable mini-timeline from Creation to Revelation.
7. **Search Bar** — Prominent, always accessible. Search across verses, dictionary, people, places.
8. **Footer** — Navigation links, about section, copyright notice, version selector (KJV active, others "coming soon").

### 2. Book Browser (`/bible`)

- Visual grid/list of all 66 books
- Filter by testament, category
- Each book card shows: name, chapter count, author, key theme, a representative image
- Animated transitions between views

### 3. Book Overview (`/bible/[book-slug]`)

- Hero with book-specific artwork
- Book metadata: author, date, key themes, description
- Chapter grid for navigation
- Related evidence items
- Key people in this book
- Map of locations mentioned
- SEO: Full meta description, JSON-LD BreadcrumbList

### 4. Chapter Reading Page (`/bible/[book-slug]/[chapter]`) — THE MOST IMPORTANT PAGE

**Layout:** Two-panel design on desktop (scripture left, context panel right). Single column on mobile with expandable panels.

**Scripture Panel (Left/Main):**
- Clean, highly readable KJV text in "Cormorant Garamond" at generous size (18-20px)
- Verse numbers styled subtly (superscript, muted gold)
- Paragraph-mode reading (not one verse per line) with option to toggle verse-per-line
- **Dictionary hotwords**: Any archaic/difficult word is subtly underlined (dotted, muted). On hover/tap → tooltip with definition + modern equivalent. On pressing "D" key → full dictionary mode activates where ALL difficult words highlight
- Click any verse number → expands to show cross-references, and a share/copy button
- Smooth chapter navigation: previous/next chapter arrows + keyboard shortcuts (← →)
- Reading progress bar at the top of the page
- Font size controls (A- A+)
- Light/Dark/Sepia theme toggle (persisted in localStorage)

**Context Panel (Right/Expandable):**
- **Tab 1: Visuals** — Paintings, photographs, illustrations relevant to this chapter. Each with title, artist, date, source link, attribution. Lazy-loaded.
- **Tab 2: Evidence** — Archaeological/historical evidence related to this chapter. Cards with images and descriptions.
- **Tab 3: Map** — Leaflet map showing locations mentioned in this chapter. Clickable pins with descriptions.
- **Tab 4: Cross-References** — List of related verses grouped by relationship type. Click to navigate.
- **Tab 5: People** — People mentioned in this chapter with mini-bios and family connections.
- **Tab 6: Notes** — User's personal notes and highlights (localStorage).

**SEO for Chapter Pages:**
- Title: "Genesis 1 KJV — The Creation | The Living Word"
- Meta description: Auto-generated from chapter summary
- JSON-LD: `WebPage`, `BreadcrumbList`, `Article` with `about: Bible`
- Canonical URLs
- Open Graph tags with a representative image

### 5. Single Verse Page (`/bible/[book-slug]/[chapter]/[verse]`)

- The verse in large, beautiful typography
- Full context (surrounding verses shown muted)
- All cross-references
- Related artwork
- Share buttons (social media, copy link)
- JSON-LD structured data for the verse
- This page is critical for SEO — each of the 31,102 verses gets its own indexable page

### 6. Interactive Maps (`/maps`)

- Full-screen Leaflet map with custom tile styling (muted, ancient-feeling)
- Toggle overlays: modern borders, ancient borders, terrain
- Clickable location pins with popup cards (image, description, scripture refs)
- Journey selector dropdown — selecting a journey animates the route on the map
- Filter by testament, book, time period
- Search locations

### 7. Timeline (`/timeline`)

- Horizontal scrollable timeline from Creation to Revelation
- Era markers (Patriarchs, Exodus, Judges, United Kingdom, Divided Kingdom, Exile, Return, Intertestamental, New Testament)
- Events plotted with images and scripture references
- Zoom in/out for detail
- Click events to navigate to related scripture

### 8. Evidence Gallery (`/evidence`)

- Masonry grid of evidence cards with images
- Filter by category (manuscripts, archaeology, inscriptions, artifacts)
- Each card shows: title, image, date, location, significance rating
- Detail page with full description, high-res image, related scriptures, source links

### 9. People Directory (`/people`)

- Alphabetical listing with search
- Filter by testament, role (king, prophet, apostle, etc.)
- Profile pages with: description, family tree visualization (simple SVG), key events, all verse references, related artwork

### 10. Dictionary (`/dictionary`)

- Alphabetical browser with letter navigation
- Search by word
- Each entry: word, pronunciation, part of speech, definition, modern equivalent, example verse with link
- **Integration with reading pages is critical** — the dictionary powers the inline definitions

### 11. Search (`/search`)

- Full-text search across all verses using FlexSearch
- Results show verse text with highlighted matches, book/chapter context
- Filter by testament, book
- Search suggestions/autocomplete
- Also searches dictionary, people, places

---

## DICTIONARY HOTKEY FEATURE (Detailed Spec)

This is a signature feature. Implementation:

1. **Default Mode:** As the user reads, archaic/difficult words have a subtle dotted underline (color: muted gold). Hovering shows a tooltip with the definition and modern equivalent. Tapping on mobile shows a bottom sheet.

2. **Dictionary Mode (Press "D"):** When the user presses the "D" key on desktop (or taps a 📖 button on mobile):
   - ALL difficult words in the current chapter illuminate with a warm highlight background
   - A small floating badge appears near the top: "Dictionary Mode ON — press D or Esc to exit"
   - Clicking any highlighted word opens a side panel or modal with the full dictionary entry
   - The panel shows: word, pronunciation, definition, modern equivalent, part of speech, usage notes, example verse, "See in Dictionary →" link
   - Pressing "D" again or "Esc" exits dictionary mode

3. **Word Detection:** Match verse text against the dictionary table. Use a pre-built Set of dictionary words for O(1) lookup. Run matching on the server during page generation (SSR) and embed word positions in the HTML as data attributes.

4. **Extensibility:** The dictionary table can be added to over time. New words added to the DB automatically appear highlighted on the next build/request.

---

## VISUAL DESIGN SYSTEM

### Color Palette
```css
:root {
  /* Dark Theme (default) */
  --bg-primary: #0F0F1A;
  --bg-secondary: #1A1A2E;
  --bg-tertiary: #252540;
  --bg-card: #1E1E35;
  --text-primary: #E8E4DC;
  --text-secondary: #A09B8C;
  --text-muted: #6B6760;
  --accent-gold: #C4975C;
  --accent-gold-light: #D4A96A;
  --accent-gold-dark: #9E7A48;
  --accent-crimson: #8B2F3F;
  --border: #2A2A45;
  --scripture-text: #F0ECE2;
  --verse-number: #8B7D6B;
  
  /* Light Theme */
  --light-bg-primary: #FDFBF7;
  --light-bg-secondary: #F5F0E8;
  --light-text-primary: #2C2416;
  --light-accent-gold: #8B6914;
  
  /* Sepia Theme */
  --sepia-bg-primary: #F4ECD8;
  --sepia-bg-secondary: #E8DFC8;
  --sepia-text-primary: #3E3428;
  --sepia-accent-gold: #7A5F2E;
}
```

### Typography
```css
/* Scripture text */
.scripture {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;    /* 20px */
  line-height: 1.9;
  letter-spacing: 0.01em;
  font-weight: 400;
}

/* UI text */
.ui-text {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}

/* Headings */
.heading {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  letter-spacing: 0.04em;
}
```

### Design Principles
- **Reverent but Modern:** Think high-end museum exhibition, not a church bulletin
- **Content-First:** Scripture text is king — everything else supports it
- **Progressive Disclosure:** Don't overwhelm. Show context on demand.
- **Performance:** Images lazy-loaded, pages server-rendered, minimal JS on initial load
- **Accessibility:** WCAG AA compliant, keyboard navigable, screen reader friendly
- **Responsive:** Mobile-first. The chapter reading page must be excellent on phones.

---

## SEO REQUIREMENTS

### Every page must have:
- Unique, descriptive `<title>` tag (format: "Page Title | The Living Word")
- Meta description (150-160 chars, compelling, includes keywords)
- Canonical URL
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags
- JSON-LD structured data (WebSite, BreadcrumbList, Article where appropriate)

### Generate automatically:
- `/sitemap.xml` — Include ALL verse pages, chapter pages, book pages, evidence, people, dictionary entries (this will be a massive sitemap — use sitemap index)
- `/robots.txt` — Allow all crawlers, reference sitemap
- RSS feed for daily verse / updates

### Page Title Patterns:
- Home: "The Living Word — King James Bible with Maps, Art & Evidence"
- Book: "Genesis KJV — Book Overview | The Living Word"
- Chapter: "Genesis 1 KJV — In the Beginning | The Living Word"
- Verse: "Genesis 1:1 KJV — 'In the beginning God created...' | The Living Word"
- Dictionary: "What does 'begat' mean in the KJV Bible? | The Living Word"
- Person: "Moses — Prophet & Lawgiver | The Living Word"
- Evidence: "Dead Sea Scrolls — Biblical Evidence | The Living Word"

### Performance:
- Core Web Vitals optimized (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Static generation (SSG) for all scripture pages where possible
- ISR (Incremental Static Regeneration) for dynamic content
- Image optimization via next/image with WebP/AVIF
- Preconnect to Google Fonts
- Bundle splitting per route

---

## KEYBOARD SHORTCUTS

| Key | Action |
|---|---|
| `D` | Toggle Dictionary Mode |
| `←` | Previous chapter |
| `→` | Next chapter |
| `T` | Cycle theme (dark → light → sepia) |
| `F` | Toggle fullscreen reading mode (hides sidebars) |
| `/` or `Ctrl+K` | Focus search |
| `Esc` | Close any open panel/modal |
| `B` | Open book browser |
| `M` | Toggle map panel |
| `+` / `-` | Increase / decrease font size |

---

## COMPONENT ARCHITECTURE

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with providers, fonts, analytics
│   ├── page.tsx                   # Landing page
│   ├── bible/
│   │   ├── page.tsx               # Book browser
│   │   ├── [bookSlug]/
│   │   │   ├── page.tsx           # Book overview
│   │   │   ├── [chapter]/
│   │   │   │   ├── page.tsx       # Chapter reading (CORE PAGE)
│   │   │   │   └── [verse]/
│   │   │   │       └── page.tsx   # Single verse
│   ├── maps/
│   │   ├── page.tsx               # Maps hub
│   │   └── [journeySlug]/page.tsx
│   ├── timeline/page.tsx
│   ├── evidence/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── people/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── dictionary/
│   │   ├── page.tsx
│   │   └── [word]/page.tsx
│   ├── search/page.tsx
│   ├── reading-plans/page.tsx
│   ├── sitemap.ts                 # Dynamic sitemap generation
│   └── robots.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Navigation bar
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx            # Context panel for reading
│   │   └── MobileNav.tsx
│   ├── scripture/
│   │   ├── VerseText.tsx          # Renders verse with dictionary hotwords
│   │   ├── ChapterView.tsx        # Full chapter rendering
│   │   ├── VerseNumber.tsx
│   │   ├── CrossRefPopover.tsx
│   │   └── ReadingProgress.tsx
│   ├── dictionary/
│   │   ├── DictionaryTooltip.tsx   # Hover tooltip
│   │   ├── DictionaryPanel.tsx     # Full side panel
│   │   ├── DictionaryModeToggle.tsx
│   │   └── DictionaryHighlight.tsx
│   ├── maps/
│   │   ├── BibleMap.tsx            # Leaflet map wrapper
│   │   ├── LocationPin.tsx
│   │   └── JourneyRoute.tsx
│   ├── media/
│   │   ├── ArtworkCard.tsx
│   │   ├── EvidenceCard.tsx
│   │   └── MediaGallery.tsx
│   ├── people/
│   │   ├── PersonCard.tsx
│   │   └── FamilyTree.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchSuggestions.tsx
│   ├── ui/                         # shadcn/ui components
│   └── shared/
│       ├── ThemeToggle.tsx
│       ├── FontSizeControl.tsx
│       ├── BookmarkButton.tsx
│       └── ShareButton.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema
│   │   ├── connection.ts          # SQLite connection
│   │   ├── seed.ts                # Seed script
│   │   └── queries.ts             # Reusable query functions
│   ├── dictionary.ts              # Dictionary matching logic
│   ├── search.ts                  # FlexSearch setup
│   ├── seo.ts                     # SEO helpers (metadata generators)
│   └── utils.ts
├── hooks/
│   ├── useDictionaryMode.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useReadingProgress.ts
│   ├── useTheme.ts
│   └── useBookmarks.ts
├── stores/
│   └── preferences.ts             # Zustand store
├── data/
│   ├── kjv.json                   # Raw KJV text for seeding
│   ├── dictionary.json            # Dictionary entries
│   ├── cross-references.json      # Cross-reference data
│   ├── locations.json             # Biblical locations with coordinates
│   ├── people.json                # Biblical people
│   ├── evidence.json              # Archaeological evidence
│   ├── journeys.json              # Journey route data
│   └── media-references.json      # Image/painting references
└── public/
    ├── images/
    │   ├── paintings/              # Optimized biblical paintings
    │   ├── evidence/               # Archaeological photos
    │   ├── maps/                   # Map overlays
    │   └── people/                 # Portraits/illustrations
    ├── og-image.jpg                # Default Open Graph image
    └── favicon.ico
```

---

## IMPLEMENTATION PRIORITIES

Build in this order:

### Phase 1: Foundation
1. Next.js project setup with TypeScript, Tailwind, shadcn/ui
2. Database schema creation with Drizzle + SQLite
3. Seed the full KJV text (all 31,102 verses)
4. Seed the dictionary (300+ words)
5. Basic routing structure
6. Root layout with theme provider and fonts

### Phase 2: Core Reading Experience
7. Chapter reading page — the most important page
8. Verse rendering with dictionary hotword detection
9. Dictionary tooltip and Dictionary Mode (D key)
10. Chapter navigation (prev/next, keyboard shortcuts)
11. Book browser page
12. Book overview page
13. Single verse page

### Phase 3: Visual Richness
14. Media/paintings database seeding
15. Context panel with Visuals tab
16. Evidence database seeding and Evidence tab
17. Location database seeding
18. Leaflet map integration — Map tab in context panel
19. Cross-references seeding and Cross-References tab

### Phase 4: Standalone Pages
20. Maps hub page with full interactive map
21. Journey routes with animation
22. Timeline page
23. Evidence gallery
24. People directory with family trees
25. Full dictionary browser
26. Search with FlexSearch

### Phase 5: Polish & SEO
27. SEO metadata for all pages
28. Sitemap generation
29. JSON-LD structured data
30. Open Graph images
31. Performance optimization
32. Theme toggle (dark/light/sepia)
33. Font size controls
34. Reading progress bar
35. Bookmarks and notes (localStorage)
36. Mobile responsiveness polish
37. Accessibility audit

---

## CRITICAL IMPLEMENTATION NOTES

1. **KJV text is public domain** — No copyright issues. Free to use entirely.

2. **Images from Wikimedia Commons** — Use the Wikimedia API to fetch images. Most biblical artwork pre-1900 is public domain. Always include attribution. For the initial build, use placeholder image URLs from Wikimedia that we'll verify later. Structure the media table so images can be easily added/updated.

3. **Dictionary extensibility** — The dictionary feature is designed to grow. Make it trivial to add new words (just insert a row in the DB). The reading page should automatically pick up new words without code changes.

4. **Translation extensibility** — The schema supports multiple translations. For now, only KJV is active. The UI should have a subtle "KJV" badge with "More translations coming soon" tooltip. The verse_translations table allows adding NIV, ESV, etc. later without schema changes.

5. **Performance is critical** — There are 31,102 verse pages + 1,189 chapter pages + 66 book pages. Use Static Site Generation for scripture pages. The full-text search should work client-side (FlexSearch indexes can be built at build time and served as static JSON).

6. **Mobile reading experience must be excellent** — Many people read the Bible on their phones. The chapter reading page must be beautiful, fast, and easy to navigate on mobile. The context panel should be accessible via bottom sheet / drawer on mobile.

7. **Respect and Reverence** — This is the Bible. The design should be beautiful and respectful. No gamification, no social media clutter, no ads. Pure, focused reading experience with scholarly enhancements.

8. **Reference Links** — Every image, every evidence item, every historical claim must have a source link. Attribution is non-negotiable. This builds credibility and trust.

9. **Do NOT use any external APIs that require API keys for the core experience.** Everything should work with the local SQLite database and static assets. Leaflet uses OpenStreetMap which requires no API key.

10. **Testing:** Include a basic test for the dictionary word matching logic and the verse rendering component.

---

## FINAL NOTES

This prompt defines a complete, buildable specification. Execute each phase methodically. The reading experience is the core — make it exceptional before moving to secondary features. Every design decision should serve readability, navigation, and the reverence this text deserves.

When in doubt: **What would a world-class museum do if they created a digital Bible experience?** That's the bar.

Build it. Make it beautiful. Make it the best Bible website on the internet.
