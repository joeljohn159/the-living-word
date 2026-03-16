import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EvidenceLoading from "../loading";

describe("EvidenceLoading (evidence page loading skeleton)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<EvidenceLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has role='status' for screen reader announcements", () => {
    render(<EvidenceLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has an aria-label describing evidence loading", () => {
    render(<EvidenceLoading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading evidence");
  });

  // ── Skeleton structure ────────────────────────────────────────────

  it("renders 6 card skeleton placeholders", () => {
    const { container } = render(<EvidenceLoading />);
    const cards = container.querySelectorAll(".rounded-xl.border");
    expect(cards).toHaveLength(6);
  });

  it("renders header skeleton with two placeholder bars", () => {
    const { container } = render(<EvidenceLoading />);
    const headerSection = container.querySelector(".text-center.mb-10");
    expect(headerSection).toBeInTheDocument();
    const headerBars = headerSection?.querySelectorAll(".animate-pulse");
    expect(headerBars?.length).toBe(2);
  });

  it("card skeletons have image placeholder areas", () => {
    const { container } = render(<EvidenceLoading />);
    const imagePlaceholders = container.querySelectorAll(".h-48");
    expect(imagePlaceholders).toHaveLength(6);
  });

  it("all card skeletons have pulse animation", () => {
    const { container } = render(<EvidenceLoading />);
    const cards = container.querySelectorAll(".rounded-xl.border.animate-pulse");
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });

  // ── Responsive grid ───────────────────────────────────────────────

  it("uses a responsive grid layout", () => {
    const { container } = render(<EvidenceLoading />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain("sm:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
  });
});
