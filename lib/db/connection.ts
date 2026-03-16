import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "data", "bible.db");

let sqlite: Database.Database | null = null;

/**
 * Get or create a singleton SQLite database connection.
 * Enables WAL mode and foreign key constraints.
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
 * Includes schema for relational queries.
 */
export const db = drizzle(getDatabase(), { schema });

/**
 * Get the raw better-sqlite3 instance for advanced operations.
 */
export function getRawDb(): Database.Database {
  return getDatabase();
}
