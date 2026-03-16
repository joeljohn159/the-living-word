import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";

/**
 * Tests for the database connection module (lib/db/connection.ts).
 * Validates singleton pattern, WAL mode, foreign keys, and exports.
 */

const mockPragma = vi.fn();
const mockDatabaseInstance = {
  pragma: mockPragma,
  close: vi.fn(),
  exec: vi.fn(),
  prepare: vi.fn(() => ({
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
  })),
};

// Track constructor calls
const constructorCalls: unknown[][] = [];

vi.mock("better-sqlite3", () => {
  // Must be a real class so `new Database(...)` works
  class MockDatabase {
    constructor(...args: unknown[]) {
      constructorCalls.push(args);
      Object.assign(this, mockDatabaseInstance);
    }
  }
  return { default: MockDatabase };
});

vi.mock("drizzle-orm/better-sqlite3", () => {
  return {
    drizzle: vi.fn((_sqliteInstance: unknown, opts?: unknown) => ({
      _opts: opts,
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      query: {},
    })),
  };
});

describe("Database connection module", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    constructorCalls.length = 0;
  });

  it("exports a db instance with Drizzle ORM wrapper", async () => {
    const { db } = await import("@/lib/db/connection");
    expect(db).toBeDefined();
    expect(db).toHaveProperty("select");
    expect(db).toHaveProperty("insert");
    expect(db).toHaveProperty("update");
    expect(db).toHaveProperty("delete");
  });

  it("exports a getRawDb function", async () => {
    const { getRawDb } = await import("@/lib/db/connection");
    expect(typeof getRawDb).toBe("function");
  });

  it("enables WAL journal mode on initialization", async () => {
    await import("@/lib/db/connection");
    expect(mockPragma).toHaveBeenCalledWith("journal_mode = WAL");
  });

  it("enables foreign key constraints on initialization", async () => {
    await import("@/lib/db/connection");
    expect(mockPragma).toHaveBeenCalledWith("foreign_keys = ON");
  });

  it("creates the database with the correct default path when DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL;
    await import("@/lib/db/connection");
    const expectedPath = path.join(process.cwd(), "data", "bible.db");
    expect(constructorCalls).toHaveLength(1);
    expect(constructorCalls[0][0]).toBe(expectedPath);
  });

  it("uses DATABASE_URL environment variable when set", async () => {
    process.env.DATABASE_URL = "/custom/path/test.db";
    await import("@/lib/db/connection");
    expect(constructorCalls).toHaveLength(1);
    expect(constructorCalls[0][0]).toBe("/custom/path/test.db");
    delete process.env.DATABASE_URL;
  });

  it("returns the same raw db instance from getRawDb (singleton)", async () => {
    const { getRawDb } = await import("@/lib/db/connection");
    const raw1 = getRawDb();
    const raw2 = getRawDb();
    expect(raw1).toBe(raw2);
  });

  it("passes schema to drizzle for relational queries", async () => {
    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    await import("@/lib/db/connection");
    expect(drizzle).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ schema: expect.any(Object) })
    );
  });
});
