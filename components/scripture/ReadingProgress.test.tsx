import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadingProgress } from "./ReadingProgress";

describe("ReadingProgress", () => {
  beforeEach(() => {
    // Reset scroll properties
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
      configurable: true,
    });
  });

  it("renders a progressbar with correct ARIA attributes", () => {
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-label", "Reading progress");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("starts at 0% progress when page is at top", () => {
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("updates progress on scroll", () => {
    render(<ReadingProgress />);

    // Scroll halfway
    Object.defineProperty(window, "scrollY", { value: 600 });
    fireEvent.scroll(window);

    const bar = screen.getByRole("progressbar");
    // 600 / (2000 - 800) = 50%
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("caps progress at 100%", () => {
    render(<ReadingProgress />);

    Object.defineProperty(window, "scrollY", { value: 2000 });
    fireEvent.scroll(window);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows 0% when document is not scrollable (no overflow)", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 800,
      configurable: true,
    });

    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("has a visual progress fill element", () => {
    render(<ReadingProgress />);

    Object.defineProperty(window, "scrollY", { value: 300 });
    fireEvent.scroll(window);

    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toBeTruthy();
    // 300 / (2000-800) = 25%
    expect(fill.style.width).toBe("25%");
  });
});
