import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Utility: compute relative luminance of an sRGB hex color.
 * Formula per WCAG 2.1 §1.4.3
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA minimum contrast ratios
const AA_NORMAL_TEXT = 4.5; // for text < 18pt (or < 14pt bold)
const AA_LARGE_TEXT = 3.0; // for text >= 18pt (or >= 14pt bold)

// ── Light theme color values from globals.css ──────────────────────────
// These must match what's defined in .theme-light
const LIGHT_BG_PRIMARY = "#FDFBF7";
const LIGHT_BG_SECONDARY = "#F5F0E8";
const LIGHT_BG_CARD = "#FFFFFF";
const LIGHT_TEXT_PRIMARY = "#2C2416";
const LIGHT_TEXT_SECONDARY = "#4A4238";
const LIGHT_TEXT_MUTED = "#736B61";
const LIGHT_ACCENT_GOLD = "#7B5B0E";
const LIGHT_ACCENT_GOLD_LIGHT = "#8B6914";
const LIGHT_VERSE_NUMBER = "#6B5D4D";

describe("Light Mode Text Contrast — WCAG AA compliance", () => {
  // ── Primary text on backgrounds ───────────────────────────────────

  it("text-primary (#2C2416) on bg-primary (#FDFBF7) meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_PRIMARY, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it("text-primary on bg-secondary meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_PRIMARY, LIGHT_BG_SECONDARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it("text-primary on bg-card (#FFFFFF) meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_PRIMARY, LIGHT_BG_CARD);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  // ── Secondary text on backgrounds ─────────────────────────────────

  it("text-secondary (#4A4238) on bg-primary meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_SECONDARY, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it("text-secondary on bg-card meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_SECONDARY, LIGHT_BG_CARD);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  // ── Muted text on backgrounds ─────────────────────────────────────

  it("text-muted (#736B61) on bg-primary meets AA for normal text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_MUTED, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it("text-muted on bg-card meets AA for at least large text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_MUTED, LIGHT_BG_CARD);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  it("text-muted on bg-secondary meets AA for at least large text", () => {
    const ratio = contrastRatio(LIGHT_TEXT_MUTED, LIGHT_BG_SECONDARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  // ── Gold accent text on backgrounds ───────────────────────────────

  it("accent-gold (#7B5B0E) on bg-primary meets AA for large text (headings)", () => {
    const ratio = contrastRatio(LIGHT_ACCENT_GOLD, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  it("accent-gold-light (#8B6914) on bg-primary meets AA for large text", () => {
    const ratio = contrastRatio(LIGHT_ACCENT_GOLD_LIGHT, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  it("accent-gold on bg-card meets AA for large text", () => {
    const ratio = contrastRatio(LIGHT_ACCENT_GOLD, LIGHT_BG_CARD);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  // ── Verse numbers ─────────────────────────────────────────────────

  it("verse-number (#6B5D4D) on bg-primary meets AA for large text", () => {
    const ratio = contrastRatio(LIGHT_VERSE_NUMBER, LIGHT_BG_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  it("verse-number on bg-card meets AA for large text", () => {
    const ratio = contrastRatio(LIGHT_VERSE_NUMBER, LIGHT_BG_CARD);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });

  // ── Badge contrast: gold text on gold bg should NOT be used ───────

  it("white text on accent-gold background has sufficient contrast for badges", () => {
    const ratio = contrastRatio("#FFFFFF", LIGHT_ACCENT_GOLD);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });
});

describe("Light Mode CSS variables in globals.css", () => {
  const cssContent = fs.readFileSync(
    path.resolve(__dirname, "../../../app/globals.css"),
    "utf-8"
  );

  // Extract the .theme-light block
  const lightThemeMatch = cssContent.match(
    /\.theme-light\s*\{([\s\S]*?)(?=\n\s*(?:\/\*|\.theme-|\}))/
  );
  const lightBlock = lightThemeMatch ? lightThemeMatch[1] : "";

  it("globals.css contains a .theme-light block", () => {
    expect(lightBlock.length).toBeGreaterThan(0);
  });

  it("light theme defines --text-muted that is darker than the old #8A8278", () => {
    // Old value #8A8278 had insufficient contrast. The current value should be darker.
    const match = lightBlock.match(/--text-muted:\s*(#[0-9A-Fa-f]{6})/);
    expect(match).toBeTruthy();
    const currentMuted = match![1];
    const currentLuminance = relativeLuminance(currentMuted);
    const oldLuminance = relativeLuminance("#8A8278");
    // Darker means lower luminance
    expect(currentLuminance).toBeLessThanOrEqual(oldLuminance);
  });

  it("light theme defines --text-secondary that is darker than the old #5C5346", () => {
    const match = lightBlock.match(/--text-secondary:\s*(#[0-9A-Fa-f]{6})/);
    expect(match).toBeTruthy();
    const currentSecondary = match![1];
    const currentLuminance = relativeLuminance(currentSecondary);
    const oldLuminance = relativeLuminance("#5C5346");
    expect(currentLuminance).toBeLessThanOrEqual(oldLuminance);
  });

  it("light theme defines a --verse-number distinct from the dark theme value #8B7D6B", () => {
    const match = lightBlock.match(/--verse-number:\s*(#[0-9A-Fa-f]{6})/);
    expect(match).toBeTruthy();
    const lightVerseNum = match![1];
    // Should be different from the dark theme value (should be darker for light bg)
    expect(lightVerseNum.toLowerCase()).not.toBe("#8b7d6b");
  });

  it("light theme --accent-gold has at least 3:1 contrast on bg-primary for headings", () => {
    const goldMatch = lightBlock.match(/--accent-gold:\s*(#[0-9A-Fa-f]{6})/);
    const bgMatch = lightBlock.match(/--bg-primary:\s*(#[0-9A-Fa-f]{6})/);
    expect(goldMatch).toBeTruthy();
    expect(bgMatch).toBeTruthy();
    const ratio = contrastRatio(goldMatch![1], bgMatch![1]);
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });
});
