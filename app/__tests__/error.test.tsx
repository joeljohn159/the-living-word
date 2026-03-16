import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "../error";

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockError = Object.assign(new globalThis.Error("Test error message"), {}) as globalThis.Error & { digest?: string };
const mockReset = vi.fn();

describe("ErrorPage (global error boundary)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
  });

  it("displays the error heading", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("An Error Occurred");
  });

  it("displays 'Something Went Wrong' label", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
  });

  // ── Museum-themed content ──────────────────────────────────────────

  it("displays the KJV quote from Psalm 46:10", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(
      screen.getByText(/Be still, and know that I am God/)
    ).toBeInTheDocument();
  });

  it("displays the verse reference", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText(/Psalm 46:10/)).toBeInTheDocument();
  });

  it("displays a helpful message to the user", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(
      screen.getByText(/We encountered an unexpected error. Please try again./)
    ).toBeInTheDocument();
  });

  // ── Reset functionality ────────────────────────────────────────────

  it("renders a 'Try Again' button", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("calls reset when 'Try Again' button is clicked", async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: /try again/i });
    await user.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  // ── Error logging ─────────────────────────────────────────────────

  it("logs the error to console on mount", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith("Application error:", mockError);
  });

  it("logs when the error changes", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    const newError = Object.assign(new globalThis.Error("A different error"), {}) as globalThis.Error & { digest?: string };
    rerender(<ErrorPage error={newError} reset={mockReset} />);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith("Application error:", newError);
  });

  // ── Theme & styling ───────────────────────────────────────────────

  it("uses gold accent color on the heading", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-gold");
  });

  it("has decorative dividers marked as aria-hidden", () => {
    const { container } = render(
      <ErrorPage error={mockError} reset={mockReset} />
    );
    const decorativeDivs = container.querySelectorAll("[aria-hidden='true']");
    expect(decorativeDivs.length).toBeGreaterThanOrEqual(2);
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("button has focus ring styles for keyboard navigation", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button.className).toContain("focus:ring-2");
  });

  it("button has adequate touch target", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button.className).toContain("touch-target");
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it("handles error with a digest property", () => {
    const digestError = Object.assign(new globalThis.Error("Digest error"), {
      digest: "abc123",
    }) as globalThis.Error & { digest?: string };
    render(<ErrorPage error={digestError} reset={mockReset} />);
    expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
  });
});
