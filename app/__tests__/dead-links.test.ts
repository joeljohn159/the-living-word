import { describe, it, expect } from "vitest";
import { NAV_LINKS } from "@/components/layout/nav-links";
import * as fs from "fs";
import * as path from "path";

/**
 * Verifies that all internal links referenced in the app point to existing pages.
 * This catches dead links at the structural level — ensuring app/[route]/page.tsx exists.
 */

const APP_DIR = path.resolve(__dirname, "..");

function pageExists(route: string): boolean {
  // Remove leading slash and convert to file path
  const routePath = route.replace(/^\//, "");
  const pagePath = path.join(APP_DIR, routePath, "page.tsx");
  return fs.existsSync(pagePath);
}

describe("Dead link verification", () => {
  describe("NAV_LINKS all point to existing pages", () => {
    NAV_LINKS.forEach(({ label, href }) => {
      it(`"${label}" → ${href} page exists`, () => {
        expect(pageExists(href)).toBe(true);
      });
    });
  });

  describe("Landing page links point to existing pages", () => {
    const LANDING_LINKS = [
      "/bible",
      "/maps",
      "/evidence",
      "/timeline",
      "/search",
      "/about",
    ];

    LANDING_LINKS.forEach((href) => {
      it(`${href} page exists`, () => {
        expect(pageExists(href)).toBe(true);
      });
    });
  });

  describe("Footer links point to existing pages", () => {
    const FOOTER_LINKS = ["/about", "/privacy"];

    FOOTER_LINKS.forEach((href) => {
      it(`${href} page exists`, () => {
        expect(pageExists(href)).toBe(true);
      });
    });
  });

  describe("ArtworkOfDay gallery link points to existing page", () => {
    it("/gallery page exists", () => {
      expect(pageExists("/gallery")).toBe(true);
    });
  });

  describe("All referenced routes have page files", () => {
    const ALL_EXPECTED_ROUTES = [
      "/bible",
      "/maps",
      "/timeline",
      "/evidence",
      "/people",
      "/dictionary",
      "/reading-plans",
      "/search",
      "/about",
      "/privacy",
      "/gallery",
    ];

    ALL_EXPECTED_ROUTES.forEach((route) => {
      it(`${route} has a page.tsx file`, () => {
        expect(pageExists(route)).toBe(true);
      });
    });
  });
});
