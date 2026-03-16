/**
 * Fetches KJV Bible text from scrollmapper/bible_databases on GitHub.
 * Caches a normalized flat format to data/kjv.json for subsequent runs.
 */

import fs from "fs";
import path from "path";

const KJV_URL =
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/en/KJV/KJV.json";

const CACHE_PATH = path.join(process.cwd(), "data", "kjv.json");

export interface KjvVerse {
  b: number; // book number (1–66)
  c: number; // chapter number
  v: number; // verse number
  t: string; // text
}

/** Scrollmapper nested format */
interface ScrollmapperBook {
  name: string;
  chapters: {
    chapter: number;
    name: string;
    verses: {
      verse: number;
      chapter: number;
      name: string;
      text: string;
    }[];
  }[];
}

interface ScrollmapperData {
  books: ScrollmapperBook[];
}

/**
 * Download KJV data from GitHub, or use cached local copy.
 */
export async function fetchKjvData(): Promise<KjvVerse[]> {
  // Check for cached file
  if (fs.existsSync(CACHE_PATH)) {
    console.log("📖 Loading KJV data from cache (data/kjv.json)...");
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as KjvVerse[];
    console.log(`   Found ${parsed.length.toLocaleString()} verses`);
    return parsed;
  }

  // Download from GitHub
  console.log("🌐 Downloading KJV Bible from scrollmapper/bible_databases...");
  console.log("   URL: " + KJV_URL);

  const response = await fetch(KJV_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to download KJV data: ${response.status} ${response.statusText}`,
    );
  }

  const raw = await response.text();
  console.log(`   Downloaded ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  // Parse the scrollmapper nested format:
  // { books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
  let verses: KjvVerse[];

  try {
    const parsed = JSON.parse(raw) as ScrollmapperData;

    if (!parsed.books || !Array.isArray(parsed.books)) {
      throw new Error("Expected { books: [...] } format");
    }

    verses = [];
    parsed.books.forEach((book, bookIndex) => {
      const bookNum = bookIndex + 1; // 1-based book number

      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          verses.push({
            b: bookNum,
            c: chapter.chapter,
            v: verse.verse,
            t: verse.text.trim(),
          });
        }
      }
    });
  } catch (parseError) {
    throw new Error(`Failed to parse KJV data: ${parseError}`);
  }

  console.log(`   Parsed ${verses.length.toLocaleString()} verses from ${66} books`);

  // Cache normalized data to disk
  const dataDir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(verses), "utf-8");
  console.log("   Cached to data/kjv.json");

  return verses;
}
