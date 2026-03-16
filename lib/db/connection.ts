import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "data", "bible.db");

let sqlite: Database.Database | null = null;

/**
 * Get or create a singleton SQLite database connection.
 */
function getDatabase(): Database.Database {
  if (!sqlite) {
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
  }
  return sqlite;
}

/**
 * Drizzle ORM database instance — singleton.
 */
export const db = drizzle(getDatabase());

/**
 * Get the raw better-sqlite3 instance for advanced operations.
 */
export function getRawDb(): Database.Database {
  return getDatabase();
}
