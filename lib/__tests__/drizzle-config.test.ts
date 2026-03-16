import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

/**
 * Tests for drizzle.config.ts — validates the Drizzle Kit configuration
 * is correctly set up for SQLite with the right schema and output paths.
 */

describe("Drizzle config", () => {
  const configPath = path.join(process.cwd(), "drizzle.config.ts");
  const configContent = readFileSync(configPath, "utf-8");

  it("uses SQLite dialect", () => {
    expect(configContent).toContain('dialect: "sqlite"');
  });

  it("points to the correct schema file", () => {
    expect(configContent).toContain('./lib/db/schema.ts');
  });

  it("outputs migrations to ./drizzle directory", () => {
    expect(configContent).toContain('./drizzle');
  });

  it("reads DATABASE_URL from environment with fallback", () => {
    expect(configContent).toContain("process.env.DATABASE_URL");
    expect(configContent).toContain("./data/bible.db");
  });

  it("satisfies the Config type from drizzle-kit", () => {
    expect(configContent).toContain("satisfies Config");
    expect(configContent).toContain('import type { Config } from "drizzle-kit"');
  });
});

describe("Package.json database scripts", () => {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  it("has db:generate script for migration generation", () => {
    expect(pkg.scripts["db:generate"]).toBe("drizzle-kit generate");
  });

  it("has db:migrate script for running migrations", () => {
    expect(pkg.scripts["db:migrate"]).toBe("drizzle-kit migrate");
  });

  it("has db:studio script for database GUI", () => {
    expect(pkg.scripts["db:studio"]).toBe("drizzle-kit studio");
  });

  it("includes drizzle-orm in dependencies", () => {
    expect(pkg.dependencies["drizzle-orm"]).toBeDefined();
  });

  it("includes drizzle-kit in devDependencies", () => {
    expect(pkg.devDependencies["drizzle-kit"]).toBeDefined();
  });

  it("includes better-sqlite3 and its types", () => {
    expect(pkg.dependencies["better-sqlite3"]).toBeDefined();
    expect(pkg.devDependencies["@types/better-sqlite3"]).toBeDefined();
  });
});
