import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "../loading";

describe("Loading (global loading skeleton)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays loading text", () => {
    render(<Loading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has role='status' for screen reader announcements", () => {
    render(<Loading />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  it("has an aria-label describing the loading state", () => {
    render(<Loading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading content");
  });

  // ── Visual indicators ─────────────────────────────────────────────

  it("contains an animated spinner element", () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("loading text has pulse animation", () => {
    render(<Loading />);
    const text = screen.getByText(/Loading/);
    expect(text.className).toContain("animate-pulse");
  });

  // ── Theme styling ─────────────────────────────────────────────────

  it("spinner uses the gold accent color via CSS variable", () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner?.className).toContain("var(--accent-gold)");
  });
});
