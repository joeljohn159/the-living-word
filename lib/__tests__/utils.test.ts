import { describe, it, expect } from "vitest";
import { cn, slugify, truncate } from "../utils";

describe("cn — Tailwind class name merger", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles conditional classes via clsx syntax", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "active", isDisabled && "disabled");
    expect(result).toBe("base active");
  });

  it("handles undefined and null inputs gracefully", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles array inputs", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });
});

describe("slugify — URL-friendly slug generation", () => {
  it("converts a simple string to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple spaces into single hyphen", () => {
    expect(slugify("multiple   spaces   here")).toBe("multiple-spaces-here");
  });

  it("collapses multiple hyphens into single hyphen", () => {
    expect(slugify("already---hyphenated")).toBe("already-hyphenated");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(slugify("!@#$%^&*()")).toBe("");
  });

  it("preserves numbers", () => {
    expect(slugify("Chapter 1")).toBe("chapter-1");
  });

  it("handles mixed case and punctuation", () => {
    expect(slugify("1 Kings: A Story")).toBe("1-kings-a-story");
  });
});

describe("truncate — text truncation with ellipsis", () => {
  it("returns original text when shorter than maxLength", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("returns original text when exactly maxLength", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });

  it("truncates and adds ellipsis when text exceeds maxLength", () => {
    const result = truncate("This is a long sentence", 10);
    expect(result).toBe("This is a...");
    expect(result.length).toBeLessThanOrEqual(13); // 10 chars + "..."
  });

  it("trims trailing whitespace before adding ellipsis", () => {
    const result = truncate("Hello World", 6);
    // slice(0,6) = "Hello " -> trimEnd() = "Hello" -> + "..." = "Hello..."
    expect(result).toBe("Hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles maxLength of 0", () => {
    expect(truncate("text", 0)).toBe("...");
  });
});
