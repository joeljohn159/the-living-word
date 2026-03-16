import { describe, it, expect } from "vitest";
import { NAV_LINKS } from "../nav-links";

describe("NAV_LINKS", () => {
  it("exports a non-empty array of nav links", () => {
    expect(Array.isArray(NAV_LINKS)).toBe(true);
    expect(NAV_LINKS.length).toBeGreaterThan(0);
  });

  it("contains all expected navigation items", () => {
    const labels = NAV_LINKS.map((link) => link.label);
    expect(labels).toContain("Bible");
    expect(labels).toContain("Maps");
    expect(labels).toContain("Timeline");
    expect(labels).toContain("Evidence");
    expect(labels).toContain("People");
    expect(labels).toContain("Dictionary");
    expect(labels).toContain("Search");
  });

  it("has valid href paths starting with '/'", () => {
    NAV_LINKS.forEach((link) => {
      expect(link.href).toMatch(/^\//);
    });
  });

  it("each link has a label, href, and icon", () => {
    NAV_LINKS.forEach((link) => {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
      expect(link.icon).toBeDefined();
    });
  });

  it("has unique hrefs for each link", () => {
    const hrefs = NAV_LINKS.map((link) => link.href);
    const uniqueHrefs = new Set(hrefs);
    expect(uniqueHrefs.size).toBe(hrefs.length);
  });

  it("has unique labels for each link", () => {
    const labels = NAV_LINKS.map((link) => link.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});
