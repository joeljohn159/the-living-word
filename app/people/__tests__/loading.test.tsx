import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PeopleLoading from "../loading";

describe("PeopleLoading (people page loading skeleton)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<PeopleLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has role='status' for screen reader announcements", () => {
    render(<PeopleLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has an aria-label describing people loading", () => {
    render(<PeopleLoading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading people");
  });

  // ── Skeleton structure ────────────────────────────────────────────

  it("renders 9 card skeleton placeholders", () => {
    const { container } = render(<PeopleLoading />);
    const cards = container.querySelectorAll(".rounded-xl.border");
    expect(cards).toHaveLength(9);
  });

  it("renders circular avatar placeholders", () => {
    const { container } = render(<PeopleLoading />);
    const avatars = container.querySelectorAll(".rounded-full");
    expect(avatars).toHaveLength(9);
  });

  it("renders header skeleton with two placeholder bars", () => {
    const { container } = render(<PeopleLoading />);
    const headerSection = container.querySelector(".text-center.mb-10");
    expect(headerSection).toBeInTheDocument();
    const headerBars = headerSection?.querySelectorAll(".animate-pulse");
    expect(headerBars?.length).toBe(2);
  });

  it("all card skeletons have pulse animation", () => {
    const { container } = render(<PeopleLoading />);
    const cards = container.querySelectorAll(".rounded-xl.border.animate-pulse");
    expect(cards.length).toBeGreaterThanOrEqual(9);
  });

  // ── Responsive grid ───────────────────────────────────────────────

  it("uses a responsive grid layout", () => {
    const { container } = render(<PeopleLoading />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain("sm:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
  });
});
