import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadingModeToggle } from "./ReadingModeToggle";

const mockSetMode = vi.fn();
let mockMode: "paragraph" | "verse-per-line" = "paragraph";

vi.mock("@/stores/preferences", () => ({
  usePreferencesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      readingMode: mockMode,
      setReadingMode: mockSetMode,
    }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("ReadingModeToggle", () => {
  beforeEach(() => {
    mockMode = "paragraph";
    mockSetMode.mockClear();
  });

  it("renders a radiogroup with correct ARIA label", () => {
    render(<ReadingModeToggle />);
    expect(screen.getByRole("radiogroup", { name: "Reading mode" })).toBeInTheDocument();
  });

  it("renders paragraph and verse-per-line radio buttons", () => {
    render(<ReadingModeToggle />);
    expect(screen.getByLabelText("Paragraph mode")).toBeInTheDocument();
    expect(screen.getByLabelText("Verse-per-line mode")).toBeInTheDocument();
  });

  it("shows paragraph mode as checked by default", () => {
    render(<ReadingModeToggle />);
    const paragraphBtn = screen.getByLabelText("Paragraph mode");
    expect(paragraphBtn).toHaveAttribute("aria-checked", "true");

    const verseBtn = screen.getByLabelText("Verse-per-line mode");
    expect(verseBtn).toHaveAttribute("aria-checked", "false");
  });

  it("calls setReadingMode when verse-per-line is clicked", () => {
    render(<ReadingModeToggle />);
    fireEvent.click(screen.getByLabelText("Verse-per-line mode"));
    expect(mockSetMode).toHaveBeenCalledWith("verse-per-line");
  });

  it("calls setReadingMode when paragraph is clicked", () => {
    mockMode = "verse-per-line";
    render(<ReadingModeToggle />);
    fireEvent.click(screen.getByLabelText("Paragraph mode"));
    expect(mockSetMode).toHaveBeenCalledWith("paragraph");
  });

  it("marks verse-per-line as checked when that mode is active", () => {
    mockMode = "verse-per-line";
    render(<ReadingModeToggle />);
    expect(screen.getByLabelText("Verse-per-line mode")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Paragraph mode")).toHaveAttribute("aria-checked", "false");
  });
});
