import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { accessSync } from "fs";
import path from "path";
import * as schema from "./schema";

/**
 * Turso / libSQL connection.
 * - Production (Vercel): uses TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars
 * - Local dev: falls back to a local file-based SQLite database
 * - Build time (no DB): uses in-memory SQLite (queries return empty results)
 */
function getDbUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  // Local dev — check if file exists
  const localPath = path.join(process.cwd(), "data", "bible.db");
  try {
    accessSync(localPath);
    return `file:${localPath}`;
  } catch {
    // No local DB (e.g. Vercel build without Turso) — use in-memory
    return "file::memory:";
  }
}

const client = createClient({
  url: getDbUrl(),
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
