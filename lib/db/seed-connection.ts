/**
 * Seed-only database connection using better-sqlite3.
 * Used by seed scripts (dev only) for fast synchronous bulk inserts.
 * The runtime app uses @libsql/client via connection.ts instead.
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const DB_PATH =
  process.env.DATABASE_URL ||
  path.join(process.cwd(), "data", "bible.db");

let sqlite: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!sqlite) {
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
  }
  return sqlite;
}

/** Drizzle ORM instance for seeding (sync, better-sqlite3). */
export const seedDb = drizzle(getDatabase(), { schema });

/** Raw better-sqlite3 instance for bulk operations. */
export function getRawDb(): Database.Database {
  return getDatabase();
}
