import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Books ──────────────────────────────────────────────────
export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  slug: text("slug").notNull().unique(),
  testament: text("testament", { enum: ["OT", "NT"] }).notNull(),
  category: text("category").notNull(),
  chapterCount: integer("chapter_count").notNull(),
  author: text("author"),
  dateWritten: text("date_written"),
  description: text("description"),
  keyThemes: text("key_themes"),
  sortOrder: integer("sort_order").notNull(),
});

// ─── Chapters ───────────────────────────────────────────────
export const chapters = sqliteTable("chapters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapterNumber: integer("chapter_number").notNull(),
  verseCount: integer("verse_count").notNull(),
  summary: text("summary"),
}, (table) => ({
  bookChapterIdx: index("idx_chapters_book_chapter").on(table.bookId, table.chapterNumber),
}));

// ─── Verses ─────────────────────────────────────────────────
export const verses = sqliteTable("verses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  chapterNumber: integer("chapter_number").notNull(),
  verseNumber: integer("verse_number").notNull(),
  text: text("text").notNull(),
}, (table) => ({
  bookChapterVerseIdx: index("idx_verses_book_chapter_verse").on(table.bookId, table.chapterNumber, table.verseNumber),
  chapterIdIdx: index("idx_verses_chapter_id").on(table.chapterId),
}));

// ─── Translations ───────────────────────────────────────────
export const translations = sqliteTable("translations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull().unique(),
  language: text("language").notNull().default("en"),
  description: text("description"),
  year: integer("year"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
});

// ─── Verse Translations ─────────────────────────────────────
export const verseTranslations = sqliteTable("verse_translations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  verseId: integer("verse_id")
    .notNull()
    .references(() => verses.id, { onDelete: "cascade" }),
  translationId: integer("translation_id")
    .notNull()
    .references(() => translations.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
});

// ─── Media ──────────────────────────────────────────────────
export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  artist: text("artist"),
  yearCreated: text("year_created"),
  sourceUrl: text("source_url"),
  imageUrl: text("image_url"),
  attribution: text("attribution"),
  license: text("license").default("Public Domain"),
  mediaType: text("media_type", { enum: ["painting", "illustration", "photograph", "map"] })
    .notNull()
    .default("painting"),
});

// ─── Media References ───────────────────────────────────────
export const mediaReferences = sqliteTable("media_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mediaId: integer("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  verseId: integer("verse_id").references(() => verses.id, { onDelete: "cascade" }),
}, (table) => ({
  chapterIdx: index("idx_media_refs_chapter").on(table.chapterId),
  bookIdx: index("idx_media_refs_book").on(table.bookId),
}));

// ─── Evidence ───────────────────────────────────────────────
export const evidence = sqliteTable("evidence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category", {
    enum: ["manuscript", "archaeology", "inscription", "artifact"],
  }).notNull(),
  dateDiscovered: text("date_discovered"),
  locationFound: text("location_found"),
  currentLocation: text("current_location"),
  significance: text("significance"),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
});

// ─── Evidence References ────────────────────────────────────
export const evidenceReferences = sqliteTable("evidence_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  evidenceId: integer("evidence_id")
    .notNull()
    .references(() => evidence.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  verseId: integer("verse_id").references(() => verses.id, { onDelete: "cascade" }),
}, (table) => ({
  chapterIdx: index("idx_evidence_refs_chapter").on(table.chapterId),
  bookIdx: index("idx_evidence_refs_book").on(table.bookId),
}));

// ─── Locations ──────────────────────────────────────────────
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  locationType: text("location_type", {
    enum: ["city", "mountain", "river", "sea", "region", "desert", "valley", "island"],
  }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  modernName: text("modern_name"),
  imageUrl: text("image_url"),
});

// ─── Location References ────────────────────────────────────
export const locationReferences = sqliteTable("location_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  verseId: integer("verse_id").references(() => verses.id, { onDelete: "cascade" }),
}, (table) => ({
  chapterIdx: index("idx_location_refs_chapter").on(table.chapterId),
  bookIdx: index("idx_location_refs_book").on(table.bookId),
}));

// ─── Journeys ───────────────────────────────────────────────
export const journeys = sqliteTable("journeys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  personName: text("person_name"),
  color: text("color").default("#C4975C"),
});

// ─── Journey Stops ──────────────────────────────────────────
export const journeyStops = sqliteTable("journey_stops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  journeyId: integer("journey_id")
    .notNull()
    .references(() => journeys.id, { onDelete: "cascade" }),
  locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
  stopOrder: integer("stop_order").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  scriptureRef: text("scripture_ref"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

// ─── Dictionary ─────────────────────────────────────────────
export const dictionary = sqliteTable("dictionary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull().unique(),
  slug: text("slug").notNull().unique(),
  definition: text("definition").notNull(),
  modernEquivalent: text("modern_equivalent"),
  partOfSpeech: text("part_of_speech"),
  pronunciation: text("pronunciation"),
  usageNotes: text("usage_notes"),
  exampleVerseId: integer("example_verse_id").references(() => verses.id, {
    onDelete: "set null",
  }),
});

// ─── Cross References ───────────────────────────────────────
export const crossReferences = sqliteTable("cross_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceVerseId: integer("source_verse_id")
    .notNull()
    .references(() => verses.id, { onDelete: "cascade" }),
  targetVerseId: integer("target_verse_id")
    .notNull()
    .references(() => verses.id, { onDelete: "cascade" }),
  relationship: text("relationship", {
    enum: ["parallel", "prophecy-fulfillment", "quotation", "allusion", "contrast"],
  }).notNull(),
  note: text("note"),
}, (table) => ({
  sourceVerseIdx: index("idx_cross_refs_source").on(table.sourceVerseId),
  targetVerseIdx: index("idx_cross_refs_target").on(table.targetVerseId),
}));

// ─── People ─────────────────────────────────────────────────
export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  alsoKnownAs: text("also_known_as"),
  description: text("description"),
  birthRef: text("birth_ref"),
  deathRef: text("death_ref"),
  fatherId: integer("father_id"),
  motherId: integer("mother_id"),
  tribeOrGroup: text("tribe_or_group"),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
});

// ─── People References ──────────────────────────────────────
export const peopleReferences = sqliteTable("people_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  verseId: integer("verse_id").references(() => verses.id, { onDelete: "cascade" }),
}, (table) => ({
  chapterIdx: index("idx_people_refs_chapter").on(table.chapterId),
  bookIdx: index("idx_people_refs_book").on(table.bookId),
}));

// ─── Reading Plans ──────────────────────────────────────────
export const readingPlans = sqliteTable("reading_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  schedule: text("schedule").notNull(), // JSON string of daily readings
});

// ═══════════════════════════════════════════════════════════
// Relations
// ═══════════════════════════════════════════════════════════

export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(chapters),
  verses: many(verses),
  mediaReferences: many(mediaReferences),
  evidenceReferences: many(evidenceReferences),
  locationReferences: many(locationReferences),
  peopleReferences: many(peopleReferences),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  book: one(books, { fields: [chapters.bookId], references: [books.id] }),
  verses: many(verses),
  mediaReferences: many(mediaReferences),
  evidenceReferences: many(evidenceReferences),
  locationReferences: many(locationReferences),
  peopleReferences: many(peopleReferences),
}));

export const versesRelations = relations(verses, ({ one, many }) => ({
  book: one(books, { fields: [verses.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [verses.chapterId], references: [chapters.id] }),
  verseTranslations: many(verseTranslations),
  sourceCrossRefs: many(crossReferences, { relationName: "sourceVerse" }),
  targetCrossRefs: many(crossReferences, { relationName: "targetVerse" }),
  mediaReferences: many(mediaReferences),
  evidenceReferences: many(evidenceReferences),
  locationReferences: many(locationReferences),
  peopleReferences: many(peopleReferences),
}));

export const translationsRelations = relations(translations, ({ many }) => ({
  verseTranslations: many(verseTranslations),
}));

export const verseTranslationsRelations = relations(verseTranslations, ({ one }) => ({
  verse: one(verses, { fields: [verseTranslations.verseId], references: [verses.id] }),
  translation: one(translations, {
    fields: [verseTranslations.translationId],
    references: [translations.id],
  }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  mediaReferences: many(mediaReferences),
}));

export const mediaReferencesRelations = relations(mediaReferences, ({ one }) => ({
  media: one(media, { fields: [mediaReferences.mediaId], references: [media.id] }),
  book: one(books, { fields: [mediaReferences.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [mediaReferences.chapterId], references: [chapters.id] }),
  verse: one(verses, { fields: [mediaReferences.verseId], references: [verses.id] }),
}));

export const evidenceRelations = relations(evidence, ({ many }) => ({
  evidenceReferences: many(evidenceReferences),
}));

export const evidenceReferencesRelations = relations(evidenceReferences, ({ one }) => ({
  evidence: one(evidence, {
    fields: [evidenceReferences.evidenceId],
    references: [evidence.id],
  }),
  book: one(books, { fields: [evidenceReferences.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [evidenceReferences.chapterId], references: [chapters.id] }),
  verse: one(verses, { fields: [evidenceReferences.verseId], references: [verses.id] }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  locationReferences: many(locationReferences),
  journeyStops: many(journeyStops),
}));

export const locationReferencesRelations = relations(locationReferences, ({ one }) => ({
  location: one(locations, {
    fields: [locationReferences.locationId],
    references: [locations.id],
  }),
  book: one(books, { fields: [locationReferences.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [locationReferences.chapterId], references: [chapters.id] }),
  verse: one(verses, { fields: [locationReferences.verseId], references: [verses.id] }),
}));

export const journeysRelations = relations(journeys, ({ many }) => ({
  stops: many(journeyStops),
}));

export const journeyStopsRelations = relations(journeyStops, ({ one }) => ({
  journey: one(journeys, { fields: [journeyStops.journeyId], references: [journeys.id] }),
  location: one(locations, { fields: [journeyStops.locationId], references: [locations.id] }),
}));

export const dictionaryRelations = relations(dictionary, ({ one }) => ({
  exampleVerse: one(verses, {
    fields: [dictionary.exampleVerseId],
    references: [verses.id],
  }),
}));

export const crossReferencesRelations = relations(crossReferences, ({ one }) => ({
  sourceVerse: one(verses, {
    fields: [crossReferences.sourceVerseId],
    references: [verses.id],
    relationName: "sourceVerse",
  }),
  targetVerse: one(verses, {
    fields: [crossReferences.targetVerseId],
    references: [verses.id],
    relationName: "targetVerse",
  }),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  father: one(people, {
    fields: [people.fatherId],
    references: [people.id],
    relationName: "fatherChild",
  }),
  mother: one(people, {
    fields: [people.motherId],
    references: [people.id],
    relationName: "motherChild",
  }),
  peopleReferences: many(peopleReferences),
}));

export const peopleReferencesRelations = relations(peopleReferences, ({ one }) => ({
  person: one(people, { fields: [peopleReferences.personId], references: [people.id] }),
  book: one(books, { fields: [peopleReferences.bookId], references: [books.id] }),
  chapter: one(chapters, { fields: [peopleReferences.chapterId], references: [chapters.id] }),
  verse: one(verses, { fields: [peopleReferences.verseId], references: [verses.id] }),
}));
