import { eq, and, like, asc } from "drizzle-orm";
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

// ─── Locations ─────────────────────────────────────────────

/** Get all locations referenced in a specific chapter. */
export async function getLocationsByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const chapter = await getChapter(bookSlug, chapterNum);
  if (!chapter) return [];

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
    .from(locationReferences)
    .innerJoin(locations, eq(locationReferences.locationId, locations.id))
    .where(eq(locationReferences.chapterId, chapter.id))
    .all();
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

// ─── Media ─────────────────────────────────────────────────

/** Get all media referenced in a specific chapter. */
export async function getMediaByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const chapter = await getChapter(bookSlug, chapterNum);
  if (!chapter) return [];

  return db
    .select({
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
}

// ─── Evidence ──────────────────────────────────────────────

/** Get all evidence referenced in a specific chapter. */
export async function getEvidenceByChapter(
  bookSlug: string,
  chapterNum: number,
) {
  const chapter = await getChapter(bookSlug, chapterNum);
  if (!chapter) return [];

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
    .where(eq(evidenceReferences.chapterId, chapter.id))
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
  const journey = db
    .select()
    .from(journeys)
    .where(eq(journeys.slug, slug))
    .get();

  if (!journey) return undefined;

  const stops = db
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
