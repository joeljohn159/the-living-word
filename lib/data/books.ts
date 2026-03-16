import { BOOK_METADATA, type BookMeta } from "@/lib/db/seed-data/book-metadata";
import { slugify } from "@/lib/utils";

/** Book data enriched with a URL-friendly slug. */
export interface BookWithSlug extends BookMeta {
  slug: string;
}

/** All 66 books with pre-computed slugs, in canonical order. */
export const ALL_BOOKS: BookWithSlug[] = BOOK_METADATA.map((book) => ({
  ...book,
  slug: slugify(book.name),
}));

/** Unique display categories, grouping Major/Minor Prophets → "Prophets" and Pauline/General Epistles → "Epistles". */
export const DISPLAY_CATEGORIES = [
  "Law",
  "History",
  "Poetry",
  "Prophets",
  "Gospels",
  "Epistles",
  "Apocalyptic",
] as const;

export type DisplayCategory = (typeof DISPLAY_CATEGORIES)[number];

/** Map a book's raw category to a display category. */
export function toDisplayCategory(rawCategory: string): DisplayCategory {
  if (rawCategory.includes("Prophets")) return "Prophets";
  if (rawCategory.includes("Epistles")) return "Epistles";
  return rawCategory as DisplayCategory;
}
