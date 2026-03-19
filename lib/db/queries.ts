import { eq, and, like, asc, desc } from "drizzle-orm";
import { db } from "./connection";
import {
  books,
  chapters,
  verses,
  crossReferences,
  dictionary,
  locations,
  locationReferences,
  people,
  peopleReferences,
  media,
  mediaReferences,
  evidence,
  evidenceReferences,
  journeys,
  journeyStops,
  verseNotes,
} from "./schema";

// ─── Books ──────────────────────────────────────────────────

/** Get all books ordered by canonical sort order. */
export async function getBooks() {
  return db
    .select()
    .from(books)
    .orderBy(asc(books.sortOrder))
    .all();
}

/** Get a single book by its URL slug. */
export async function getBookBySlug(slug: string) {
  return db
    .select()
    .from(books)
    .where(eq(books.slug, slug))
    .get();
}

// ─── Chapters & Verses ─────────────────────────────────────

/** Get a single chapter by book slug and chapter number. */
export async function getChapter(bookSlug: string, chapterNum: number) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return undefined;

  return db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.bookId, book.id),
        eq(chapters.chapterNumber, chapterNum),
      ),
    )
    .get();
}

/** Get a single verse by book slug, chapter number, and verse number. */
export async function getVerse(
  bookSlug: string,
  chapter: number,
  verse: number,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return undefined;

  return db
    .select()
    .from(verses)
    .where(
      and(
        eq(verses.bookId, book.id),
        eq(verses.chapterNumber, chapter),
        eq(verses.verseNumber, verse),
      ),
    )
    .get();
}

/** Get all verses for a chapter, ordered by verse number. */
export async function getChapterVerses(bookSlug: string, chapterNum: number) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  return db
    .select()
    .from(verses)
    .where(
      and(
        eq(verses.bookId, book.id),
        eq(verses.chapterNumber, chapterNum),
      ),
    )
    .orderBy(asc(verses.verseNumber))
    .all();
}

/** Get surrounding verses for context (before and after a given verse). */
export async function getSurroundingVerses(
  bookSlug: string,
  chapterNum: number,
  verseNum: number,
  range = 2,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const allVerses = await db
    .select()
    .from(verses)
    .where(
      and(
        eq(verses.bookId, book.id),
        eq(verses.chapterNumber, chapterNum),
      ),
    )
    .orderBy(asc(verses.verseNumber))
    .all();

  return allVerses.filter(
    (v) =>
      v.verseNumber >= verseNum - range &&
      v.verseNumber <= verseNum + range &&
      v.verseNumber !== verseNum,
  );
}

/** Get the total number of verses in a chapter for a given book slug. */
export async function getChapterVerseCount(
  bookSlug: string,
  chapterNum: number,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return 0;

  const result = await db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.bookId, book.id),
        eq(chapters.chapterNumber, chapterNum),
      ),
    )
    .get();

  return result?.verseCount ?? 0;
}

// ─── Cross References ──────────────────────────────────────

/** Get all cross-references for a given verse ID. */
export async function getCrossReferences(verseId: number) {
  return db
    .select({
      id: crossReferences.id,
      sourceVerseId: crossReferences.sourceVerseId,
      targetVerseId: crossReferences.targetVerseId,
      relationship: crossReferences.relationship,
      note: crossReferences.note,
      targetBook: books.name,
      targetBookSlug: books.slug,
      targetChapter: verses.chapterNumber,
      targetVerse: verses.verseNumber,
      targetText: verses.text,
    })
    .from(crossReferences)
    .innerJoin(verses, eq(crossReferences.targetVerseId, verses.id))
    .innerJoin(books, eq(verses.bookId, books.id))
    .where(eq(crossReferences.sourceVerseId, verseId))
    .all();
}

/** Get all cross-references for every verse in a chapter. */
export async function getChapterCrossReferences(
  bookSlug: string,
  chapterNum: number,
) {
  const chapterVerses = await getChapterVerses(bookSlug, chapterNum);
  if (chapterVerses.length === 0) return [];

  const verseIds = chapterVerses.map((v) => v.id);

  const allRefs = [];
  for (const verseId of verseIds) {
    const refs = await getCrossReferences(verseId);
    const verse = chapterVerses.find((v) => v.id === verseId);
    for (const ref of refs) {
      allRefs.push({
        ...ref,
        sourceVerseNumber: verse?.verseNumber ?? 0,
      });
    }
  }

  return allRefs;
}

// ─── Dictionary ────────────────────────────────────────────

/** Get a single dictionary word by its slug. */
export async function getDictionaryWord(wordSlug: string) {
  return db
    .select()
    .from(dictionary)
    .where(eq(dictionary.slug, wordSlug))
    .get();
}

/** Get all dictionary words ordered alphabetically. */
export async function getDictionaryWords() {
  return db
    .select()
    .from(dictionary)
    .orderBy(asc(dictionary.word))
    .all();
}

/** Get dictionary words filtered by starting letter. */
export async function getDictionaryWordsByLetter(letter: string) {
  const pattern = `${letter.toLowerCase()}%`;
  return db
    .select()
    .from(dictionary)
    .where(like(dictionary.slug, pattern))
    .orderBy(asc(dictionary.word))
    .all();
}

/** Search dictionary words by partial match. */
export async function searchDictionaryWords(query: string) {
  if (!query.trim()) return [];
  const pattern = `%${query.toLowerCase()}%`;
  return db
    .select()
    .from(dictionary)
    .where(like(dictionary.word, pattern))
    .orderBy(asc(dictionary.word))
    .all();
}

/** Get a dictionary word by slug with its example verse and book info. */
export async function getDictionaryWordWithVerse(wordSlug: string) {
  const word = await db
    .select()
    .from(dictionary)
    .where(eq(dictionary.slug, wordSlug))
    .get();

  if (!word) return undefined;

  let exampleVerse = undefined;
  if (word.exampleVerseId) {
    exampleVerse = await db
      .select({
        id: verses.id,
        bookId: verses.bookId,
        chapterNumber: verses.chapterNumber,
        verseNumber: verses.verseNumber,
        text: verses.text,
        bookName: books.name,
        bookSlug: books.slug,
      })
      .from(verses)
      .innerJoin(books, eq(verses.bookId, books.id))
      .where(eq(verses.id, word.exampleVerseId))
      .get();
  }

  return { ...word, exampleVerse };
}

/** Get all unique first letters in the dictionary. */
export async function getDictionaryLetters(): Promise<string[]> {
  const words = await db
    .select({ word: dictionary.word })
    .from(dictionary)
    .orderBy(asc(dictionary.word))
    .all();

  const letters = new Set<string>();
  for (const w of words) {
    const first = w.word.charAt(0).toUpperCase();
    if (first >= "A" && first <= "Z") {
      letters.add(first);
    }
  }
  return Array.from(letters).sort();
}

// ─── Locations ─────────────────────────────────────────────

/** Get all locations referenced in a specific chapter, falling back to book-level locations. */
export async function getLocationsByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const chapter = await getChapter(bookSlug, chapterNum);

  // First try chapter-specific locations
  if (chapter) {
    const chapterLocations = await db
      .select({
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        description: locations.description,
        locationType: locations.locationType,
        latitude: locations.latitude,
        longitude: locations.longitude,
        modernName: locations.modernName,
        imageUrl: locations.imageUrl,
      })
      .from(locationReferences)
      .innerJoin(locations, eq(locationReferences.locationId, locations.id))
      .where(eq(locationReferences.chapterId, chapter.id))
      .all();

    if (chapterLocations.length > 0) return chapterLocations;
  }

  // No chapter-specific locations found; return empty rather than overwhelming with book-level data
  return [];
}

/** Get all locations ordered by name. */
export async function getAllLocations() {
  return db
    .select({
      id: locations.id,
      name: locations.name,
      slug: locations.slug,
      description: locations.description,
      locationType: locations.locationType,
      latitude: locations.latitude,
      longitude: locations.longitude,
      modernName: locations.modernName,
      imageUrl: locations.imageUrl,
    })
    .from(locations)
    .orderBy(asc(locations.name))
    .all();
}

/** Get all location slugs for sitemap generation. */
export async function getAllLocationSlugs() {
  return db.select({ slug: locations.slug }).from(locations).all();
}

/** Get all journey slugs for static params generation. */
export async function getAllJourneySlugs() {
  return db.select({ slug: journeys.slug }).from(journeys).all();
}

/** Get locations with their book references for testament filtering. */
export async function getLocationsWithBookRefs() {
  const allLocs = await getAllLocations();
  const refs = await db
    .select({
      locationId: locationReferences.locationId,
      bookId: locationReferences.bookId,
      testament: books.testament,
      bookSlug: books.slug,
      bookName: books.name,
    })
    .from(locationReferences)
    .innerJoin(books, eq(locationReferences.bookId, books.id))
    .all();

  const refMap = new Map<number, { testaments: Set<string>; books: Set<string>; bookNames: Set<string> }>();
  for (const ref of refs) {
    if (!refMap.has(ref.locationId)) {
      refMap.set(ref.locationId, { testaments: new Set(), books: new Set(), bookNames: new Set() });
    }
    const entry = refMap.get(ref.locationId)!;
    if (ref.testament) entry.testaments.add(ref.testament);
    if (ref.bookSlug) entry.books.add(ref.bookSlug);
    if (ref.bookName) entry.bookNames.add(ref.bookName);
  }

  return allLocs.map((loc) => {
    const entry = refMap.get(loc.id);
    return {
      ...loc,
      testaments: entry ? Array.from(entry.testaments) : [],
      bookSlugs: entry ? Array.from(entry.books) : [],
      bookNames: entry ? Array.from(entry.bookNames) : [],
    };
  });
}

// ─── People ────────────────────────────────────────────────

/** Get all people referenced in a specific chapter. */
export async function getPeopleByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const chapter = await getChapter(bookSlug, chapterNum);
  if (!chapter) return [];

  return db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      description: people.description,
      alsoKnownAs: people.alsoKnownAs,
      tribeOrGroup: people.tribeOrGroup,
    })
    .from(peopleReferences)
    .innerJoin(people, eq(peopleReferences.personId, people.id))
    .where(eq(peopleReferences.chapterId, chapter.id))
    .all();
}

/** Get people for a chapter with family connection names. */
export async function getPeopleByChapterWithFamily(
  bookSlug: string,
  chapterNum: number,
) {
  const basePeople = await getPeopleByChapter(bookSlug, chapterNum);
  if (basePeople.length === 0) return [];

  // Deduplicate (a person can be referenced by multiple verses in a chapter)
  const uniqueMap = new Map<number, (typeof basePeople)[0]>();
  for (const p of basePeople) {
    uniqueMap.set(p.id, p);
  }
  const unique = Array.from(uniqueMap.values());

  // Enrich with family data via relational query
  const enriched = await Promise.all(
    unique.map(async (p) => {
      const full = await db.query.people.findFirst({
        where: eq(people.id, p.id),
        with: { father: true, mother: true },
      });

      // Find spouse: someone who shares a child with this person
      const children = await db
        .select({ id: people.id, motherId: people.motherId, fatherId: people.fatherId })
        .from(people)
        .where(eq(people.fatherId, p.id))
        .all();

      let spouseName: string | null = null;
      if (children.length > 0 && children[0].motherId) {
        const spouse = await db
          .select({ name: people.name })
          .from(people)
          .where(eq(people.id, children[0].motherId))
          .get();
        spouseName = spouse?.name ?? null;
      }
      // Also check if this person is a mother
      if (!spouseName) {
        const asMotherChildren = await db
          .select({ fatherId: people.fatherId })
          .from(people)
          .where(eq(people.motherId, p.id))
          .all();
        if (asMotherChildren.length > 0 && asMotherChildren[0].fatherId) {
          const spouse = await db
            .select({ name: people.name })
            .from(people)
            .where(eq(people.id, asMotherChildren[0].fatherId))
            .get();
          spouseName = spouse?.name ?? null;
        }
      }

      return {
        ...p,
        fatherName: full?.father?.name ?? null,
        motherName: full?.mother?.name ?? null,
        spouseName,
      };
    }),
  );

  return enriched;
}

// ─── Media ─────────────────────────────────────────────────

/** Get all media referenced in a specific chapter, falling back to book-level media. */
export async function getMediaByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const chapter = await getChapter(bookSlug, chapterNum);

  // First try chapter-specific media
  if (chapter) {
    const chapterMedia = await db
      .selectDistinct({
        id: media.id,
        title: media.title,
        description: media.description,
        artist: media.artist,
        yearCreated: media.yearCreated,
        sourceUrl: media.sourceUrl,
        imageUrl: media.imageUrl,
        attribution: media.attribution,
        license: media.license,
        mediaType: media.mediaType,
      })
      .from(mediaReferences)
      .innerJoin(media, eq(mediaReferences.mediaId, media.id))
      .where(eq(mediaReferences.chapterId, chapter.id))
      .all();

    if (chapterMedia.length > 0) return chapterMedia;
  }

  // Fall back to book-level media (deduplicated)
  return db
    .selectDistinct({
      id: media.id,
      title: media.title,
      description: media.description,
      artist: media.artist,
      yearCreated: media.yearCreated,
      sourceUrl: media.sourceUrl,
      imageUrl: media.imageUrl,
      attribution: media.attribution,
      license: media.license,
      mediaType: media.mediaType,
    })
    .from(mediaReferences)
    .innerJoin(media, eq(mediaReferences.mediaId, media.id))
    .where(eq(mediaReferences.bookId, book.id))
    .all();
}

// ─── Gallery ──────────────────────────────────────────────

/** Get all media (artwork) ordered by title. */
export async function getAllMedia() {
  return db
    .select()
    .from(media)
    .orderBy(asc(media.title))
    .all();
}

// ─── Evidence ──────────────────────────────────────────────

/** Get all evidence referenced in a specific chapter, falling back to book-level evidence. */
export async function getEvidenceByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  const chapter = await getChapter(bookSlug, chapterNum);

  // First try chapter-specific evidence
  if (chapter) {
    const chapterEvidence = await db
      .select({
        id: evidence.id,
        title: evidence.title,
        slug: evidence.slug,
        description: evidence.description,
        category: evidence.category,
        dateDiscovered: evidence.dateDiscovered,
        locationFound: evidence.locationFound,
        currentLocation: evidence.currentLocation,
        significance: evidence.significance,
        imageUrl: evidence.imageUrl,
        sourceUrl: evidence.sourceUrl,
      })
      .from(evidenceReferences)
      .innerJoin(evidence, eq(evidenceReferences.evidenceId, evidence.id))
      .where(eq(evidenceReferences.chapterId, chapter.id))
      .all();

    if (chapterEvidence.length > 0) return chapterEvidence;
  }

  // Fall back to book-level evidence
  return db
    .select({
      id: evidence.id,
      title: evidence.title,
      slug: evidence.slug,
      description: evidence.description,
      category: evidence.category,
      dateDiscovered: evidence.dateDiscovered,
      locationFound: evidence.locationFound,
      currentLocation: evidence.currentLocation,
      significance: evidence.significance,
      imageUrl: evidence.imageUrl,
      sourceUrl: evidence.sourceUrl,
    })
    .from(evidenceReferences)
    .innerJoin(evidence, eq(evidenceReferences.evidenceId, evidence.id))
    .where(eq(evidenceReferences.bookId, book.id))
    .all();
}

// ─── Search ────────────────────────────────────────────────

/** Full-text search across verses. Returns matching verses with book info. */
export async function searchVerses(query: string, limit = 50) {
  if (!query.trim()) return [];

  const pattern = `%${query}%`;

  return db
    .select({
      id: verses.id,
      bookId: verses.bookId,
      chapterNumber: verses.chapterNumber,
      verseNumber: verses.verseNumber,
      text: verses.text,
      bookName: books.name,
      bookSlug: books.slug,
    })
    .from(verses)
    .innerJoin(books, eq(verses.bookId, books.id))
    .where(like(verses.text, pattern))
    .limit(limit)
    .all();
}

// ─── Journeys ──────────────────────────────────────────────

/** Get all journeys. */
export async function getJourneys() {
  return db
    .select()
    .from(journeys)
    .orderBy(asc(journeys.name))
    .all();
}

/** Get a journey with all its stops by slug. */
export async function getJourneyWithStops(slug: string) {
  const journey = await db
    .select()
    .from(journeys)
    .where(eq(journeys.slug, slug))
    .get();

  if (!journey) return undefined;

  const stops = await db
    .select({
      id: journeyStops.id,
      stopOrder: journeyStops.stopOrder,
      name: journeyStops.name,
      description: journeyStops.description,
      scriptureRef: journeyStops.scriptureRef,
      latitude: journeyStops.latitude,
      longitude: journeyStops.longitude,
      locationId: journeyStops.locationId,
      locationName: locations.name,
      locationSlug: locations.slug,
    })
    .from(journeyStops)
    .leftJoin(locations, eq(journeyStops.locationId, locations.id))
    .where(eq(journeyStops.journeyId, journey.id))
    .orderBy(asc(journeyStops.stopOrder))
    .all();

  return { ...journey, stops };
}

// ─── Person Detail ─────────────────────────────────────────

/** Get all people ordered alphabetically with basic info. */
export async function getAllPeople() {
  return db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      description: people.description,
      alsoKnownAs: people.alsoKnownAs,
      tribeOrGroup: people.tribeOrGroup,
      birthRef: people.birthRef,
      deathRef: people.deathRef,
      imageUrl: people.imageUrl,
      sourceUrl: people.sourceUrl,
    })
    .from(people)
    .orderBy(asc(people.name))
    .all();
}

/** Get a single person by slug with parent info. */
export async function getPerson(slug: string) {
  return db.query.people.findFirst({
    where: eq(people.slug, slug),
    with: {
      father: true,
      mother: true,
      peopleReferences: {
        with: {
          book: true,
          chapter: true,
          verse: true,
        },
      },
    },
  });
}

/** Get children of a person by their ID. */
export async function getPersonChildren(personId: number) {
  return db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      description: people.description,
    })
    .from(people)
    .where(eq(people.fatherId, personId))
    .orderBy(asc(people.name))
    .all();
}

/** Get siblings of a person (same father, excluding self). */
export async function getPersonSiblings(personId: number, fatherId: number | null) {
  if (!fatherId) return [];
  const allChildren = await db
    .select({ id: people.id, name: people.name, slug: people.slug })
    .from(people)
    .where(eq(people.fatherId, fatherId))
    .orderBy(asc(people.name))
    .all();
  return allChildren.filter((c) => c.id !== personId);
}

/** Get all people slugs for static params generation. */
export async function getAllPeopleSlugs() {
  return db.select({ slug: people.slug }).from(people).all();
}

/** Get media related to a person via shared book references. */
export async function getPersonMedia(personId: number) {
  const refs = await db
    .select({ bookId: peopleReferences.bookId })
    .from(peopleReferences)
    .where(eq(peopleReferences.personId, personId))
    .all();

  if (refs.length === 0) return [];
  const bookIds = Array.from(new Set(refs.map((r) => r.bookId).filter(Boolean))) as number[];
  if (bookIds.length === 0) return [];

  return db
    .selectDistinct({
      id: media.id,
      title: media.title,
      description: media.description,
      artist: media.artist,
      yearCreated: media.yearCreated,
      imageUrl: media.imageUrl,
      sourceUrl: media.sourceUrl,
      attribution: media.attribution,
      license: media.license,
      mediaType: media.mediaType,
    })
    .from(mediaReferences)
    .innerJoin(media, eq(mediaReferences.mediaId, media.id))
    .where(eq(mediaReferences.bookId, bookIds[0]))
    .limit(6)
    .all();
}

// ─── Book-level aggregation queries ────────────────────────

/** Get all people referenced in a specific book. */
export async function getBookPeople(bookSlug: string) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  return db
    .selectDistinct({
      id: people.id,
      name: people.name,
      slug: people.slug,
      description: people.description,
      alsoKnownAs: people.alsoKnownAs,
      tribeOrGroup: people.tribeOrGroup,
    })
    .from(peopleReferences)
    .innerJoin(people, eq(peopleReferences.personId, people.id))
    .where(eq(peopleReferences.bookId, book.id))
    .orderBy(asc(people.name))
    .all();
}

/** Get all locations referenced in a specific book. */
export async function getBookLocations(bookSlug: string) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  return db
    .selectDistinct({
      id: locations.id,
      name: locations.name,
      slug: locations.slug,
      description: locations.description,
      locationType: locations.locationType,
      latitude: locations.latitude,
      longitude: locations.longitude,
      modernName: locations.modernName,
      imageUrl: locations.imageUrl,
    })
    .from(locationReferences)
    .innerJoin(locations, eq(locationReferences.locationId, locations.id))
    .where(eq(locationReferences.bookId, book.id))
    .orderBy(asc(locations.name))
    .all();
}

/** Get all media referenced in a specific book. */
export async function getBookMedia(bookSlug: string) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  return db
    .selectDistinct({
      id: media.id,
      title: media.title,
      description: media.description,
      artist: media.artist,
      yearCreated: media.yearCreated,
      sourceUrl: media.sourceUrl,
      imageUrl: media.imageUrl,
      attribution: media.attribution,
      license: media.license,
      mediaType: media.mediaType,
    })
    .from(mediaReferences)
    .innerJoin(media, eq(mediaReferences.mediaId, media.id))
    .where(eq(mediaReferences.bookId, book.id))
    .orderBy(asc(media.title))
    .all();
}

/** Get all evidence items, optionally filtered by category. */
type EvidenceCategory = "manuscript" | "archaeology" | "inscription" | "artifact";

const VALID_CATEGORIES: EvidenceCategory[] = ["manuscript", "archaeology", "inscription", "artifact"];

export async function getAllEvidence(category?: string) {
  if (category && VALID_CATEGORIES.includes(category as EvidenceCategory)) {
    return db
      .select()
      .from(evidence)
      .where(eq(evidence.category, category as EvidenceCategory))
      .orderBy(asc(evidence.title))
      .all();
  }
  return db
    .select()
    .from(evidence)
    .orderBy(asc(evidence.title))
    .all();
}

/** Get a single evidence item by slug with its related scripture references. */
export async function getEvidenceBySlug(slug: string) {
  const item = await db
    .select()
    .from(evidence)
    .where(eq(evidence.slug, slug))
    .get();

  if (!item) return undefined;

  const refs = await db
    .select({
      id: evidenceReferences.id,
      bookId: evidenceReferences.bookId,
      bookName: books.name,
      bookSlug: books.slug,
      chapterId: evidenceReferences.chapterId,
      chapterNumber: chapters.chapterNumber,
      verseId: evidenceReferences.verseId,
      verseNumber: verses.verseNumber,
    })
    .from(evidenceReferences)
    .leftJoin(books, eq(evidenceReferences.bookId, books.id))
    .leftJoin(chapters, eq(evidenceReferences.chapterId, chapters.id))
    .leftJoin(verses, eq(evidenceReferences.verseId, verses.id))
    .where(eq(evidenceReferences.evidenceId, item.id))
    .all();

  return { ...item, references: refs };
}

/** Get evidence count per category. */
export async function getEvidenceCategoryCounts() {
  const all = await db.select().from(evidence).all();
  const counts: Record<string, number> = {};
  for (const item of all) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return counts;
}

// ─── Sitemap Queries ──────────────────────────────────────

/** Get all chapters with book slug for sitemap generation. */
export async function getSitemapChapters() {
  return db
    .select({
      bookSlug: books.slug,
      chapterNumber: chapters.chapterNumber,
      verseCount: chapters.verseCount,
    })
    .from(chapters)
    .innerJoin(books, eq(chapters.bookId, books.id))
    .orderBy(asc(books.sortOrder), asc(chapters.chapterNumber))
    .all();
}

/** Get all evidence slugs for sitemap generation. */
export async function getAllEvidenceSlugs() {
  return db.select({ slug: evidence.slug }).from(evidence).all();
}

/** Get all dictionary slugs for sitemap generation. */
export async function getAllDictionarySlugs() {
  return db.select({ slug: dictionary.slug }).from(dictionary).all();
}

/** Get all evidence referenced in a specific book. */
export async function getBookEvidence(bookSlug: string) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return [];

  return db
    .selectDistinct({
      id: evidence.id,
      title: evidence.title,
      slug: evidence.slug,
      description: evidence.description,
      category: evidence.category,
      dateDiscovered: evidence.dateDiscovered,
      locationFound: evidence.locationFound,
      currentLocation: evidence.currentLocation,
      significance: evidence.significance,
      imageUrl: evidence.imageUrl,
      sourceUrl: evidence.sourceUrl,
    })
    .from(evidenceReferences)
    .innerJoin(evidence, eq(evidenceReferences.evidenceId, evidence.id))
    .where(eq(evidenceReferences.bookId, book.id))
    .orderBy(asc(evidence.title))
    .all();
}

// ─── Verse Notes ──────────────────────────────────────────

/** Get all notes for a specific chapter (all verses). */
export async function getChapterVerseNotes(bookSlug: string, chapterNum: number) {
  return db
    .select()
    .from(verseNotes)
    .where(
      and(
        eq(verseNotes.bookSlug, bookSlug),
        eq(verseNotes.chapterNumber, chapterNum),
      ),
    )
    .orderBy(verseNotes.verseNumber, desc(verseNotes.updatedAt))
    .all();
}

/** Create a new verse note. */
export async function createVerseNote(
  bookSlug: string,
  chapterNum: number,
  verseNum: number,
  content: string,
) {
  const now = new Date().toISOString();
  return db
    .insert(verseNotes)
    .values({
      bookSlug,
      chapterNumber: chapterNum,
      verseNumber: verseNum,
      content,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

/** Update an existing verse note. */
export async function updateVerseNote(id: number, content: string) {
  const now = new Date().toISOString();
  return db
    .update(verseNotes)
    .set({ content, updatedAt: now })
    .where(eq(verseNotes.id, id))
    .returning()
    .get();
}

/** Delete a verse note. */
export async function deleteVerseNote(id: number) {
  return db.delete(verseNotes).where(eq(verseNotes.id, id)).run();
}
