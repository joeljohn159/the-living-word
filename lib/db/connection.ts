import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";
import * as schema from "./schema";

/**
 * Turso / libSQL connection.
 * - Production (Vercel): uses TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars
 * - Local dev: falls back to a local file-based SQLite database
 */
const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    `file:${path.join(process.cwd(), "data", "bible.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Drizzle ORM database instance — singleton.
 * Includes schema for relational queries.
 */
export const db = drizzle(client, { schema });

/**
 * Get the raw libSQL client for advanced operations.
 */
export function getRawClient() {
  return client;
}
