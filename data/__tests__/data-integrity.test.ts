import { describe, it, expect } from "vitest";
import evidenceData from "../evidence.json";
import peopleData from "../people.json";

const WIKIMEDIA_URL_PATTERN =
  /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//;

describe("Evidence data integrity", () => {
  it("evidence.json is a non-empty array", () => {
    expect(Array.isArray(evidenceData)).toBe(true);
    expect(evidenceData.length).toBeGreaterThan(0);
  });

  it("every evidence item has required fields", () => {
    for (const item of evidenceData) {
      expect(item.title).toBeTruthy();
      expect(item.slug).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.category).toBeTruthy();
    }
  });

  it("every evidence item has a valid Wikimedia image_url", () => {
    const itemsMissingImages: string[] = [];
    for (const item of evidenceData) {
      if (!item.image_url || !WIKIMEDIA_URL_PATTERN.test(item.image_url)) {
        itemsMissingImages.push(item.title);
      }
    }
    expect(
      itemsMissingImages,
      `Evidence items with missing/invalid Wikimedia image URLs: ${itemsMissingImages.join(", ")}`
    ).toHaveLength(0);
  });

  it("every evidence item with an image_url also has a source_url", () => {
    for (const item of evidenceData) {
      if (item.image_url) {
        expect(
          item.source_url,
          `${item.title} has image_url but no source_url`
        ).toBeTruthy();
      }
    }
  });

  it("source_urls point to Wikimedia Commons", () => {
    for (const item of evidenceData) {
      if (item.source_url) {
        expect(
          item.source_url,
          `${item.title} source_url should be a Wikimedia Commons link`
        ).toMatch(/commons\.wikimedia\.org/);
      }
    }
  });

  it("evidence categories are valid values", () => {
    const validCategories = ["manuscript", "archaeology", "inscription", "artifact"];
    for (const item of evidenceData) {
      expect(
        validCategories,
        `${item.title} has invalid category: ${item.category}`
      ).toContain(item.category);
    }
  });

  it("all evidence slugs are unique", () => {
    const slugs = evidenceData.map((item) => item.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("book_refs are non-empty arrays", () => {
    for (const item of evidenceData) {
      expect(
        Array.isArray(item.book_refs),
        `${item.title} should have a book_refs array`
      ).toBe(true);
      expect(
        item.book_refs.length,
        `${item.title} should have at least one book reference`
      ).toBeGreaterThan(0);
    }
  });
});

describe("People data integrity", () => {
  const people = peopleData.people;

  it("people array is non-empty", () => {
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThan(0);
  });

  it("every person has required fields", () => {
    for (const person of people) {
      expect(person.name, "name is required").toBeTruthy();
      expect(person.description, `${person.name} should have a description`).toBeTruthy();
    }
  });

  it("major biblical figures have Wikimedia image URLs", () => {
    const majorFigures = [
      "Adam",
      "Eve",
      "Noah",
      "Abraham",
      "Moses",
      "David",
      "Solomon",
      "Jesus",
      "Paul",
    ];

    const missingImages: string[] = [];
    for (const figureName of majorFigures) {
      const person = people.find((p) => p.name === figureName);
      if (!person) {
        missingImages.push(`${figureName} (not found in data)`);
        continue;
      }
      if (
        !person.image_url ||
        !WIKIMEDIA_URL_PATTERN.test(person.image_url)
      ) {
        missingImages.push(figureName);
      }
    }
    expect(
      missingImages,
      `Major figures missing valid Wikimedia images: ${missingImages.join(", ")}`
    ).toHaveLength(0);
  });

  it("people with image_url also have source_url", () => {
    for (const person of people) {
      if (person.image_url) {
        expect(
          person.source_url,
          `${person.name} has image_url but no source_url for attribution`
        ).toBeTruthy();
      }
    }
  });

  it("image source_urls point to Wikimedia Commons", () => {
    for (const person of people) {
      if (person.source_url) {
        expect(
          person.source_url,
          `${person.name} source_url should be a Wikimedia Commons link`
        ).toMatch(/commons\.wikimedia\.org/);
      }
    }
  });

  it("people_references array exists", () => {
    expect(Array.isArray(peopleData.people_references)).toBe(true);
  });
});
