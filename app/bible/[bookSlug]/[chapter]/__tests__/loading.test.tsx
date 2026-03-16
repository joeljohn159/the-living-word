import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChapterLoading from "../loading";

describe("ChapterLoading (bible chapter loading skeleton)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<ChapterLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has role='status' for screen reader announcements", () => {
    render(<ChapterLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has an aria-label describing chapter loading", () => {
    render(<ChapterLoading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading chapter");
  });

  // ── Skeleton structure ────────────────────────────────────────────

  it("renders 12 verse skeleton rows", () => {
    const { container } = render(<ChapterLoading />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    // 12 verse rows + header elements all have animate-pulse
    expect(pulseElements.length).toBeGreaterThanOrEqual(12);
  });

  it("renders header skeleton placeholders", () => {
    const { container } = render(<ChapterLoading />);
    // The header area has two skeleton bars (book name + chapter number)
    const headerSection = container.querySelector(".text-center.mb-10");
    expect(headerSection).toBeInTheDocument();
    const headerBars = headerSection?.querySelectorAll(".animate-pulse");
    expect(headerBars?.length).toBe(2);
  });

  it("renders verse number placeholders with gold accent", () => {
    const { container } = render(<ChapterLoading />);
    const verseNumbers = container.querySelectorAll(
      "[class*='var(--accent-gold)']"
    );
    expect(verseNumbers.length).toBeGreaterThan(0);
  });
});
