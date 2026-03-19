import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScriptureDisplay } from "./ScriptureDisplay";

// Mock the preferences store
const mockStore: { fontSize: number; readingMode: "paragraph" | "verse-per-line" } = { fontSize: 20, readingMode: "paragraph" };

vi.mock("@/stores/preferences", () => ({
  usePreferencesStore: (selector: (s: typeof mockStore) => unknown) =>
    selector(mockStore),
}));

// Mock CrossRefPopover to avoid pulling in cross-ref store
vi.mock("./CrossRefPopover", () => ({
  CrossRefPopover: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="cross-ref-popover">{children}</span>
  ),
}));

const sampleVerses = [
  { id: 1, verseNumber: 1, text: "In the beginning God created the heaven and the earth." },
  { id: 2, verseNumber: 2, text: "And the earth was without form, and void." },
  { id: 3, verseNumber: 3, text: "And God said, Let there be light: and there was light." },
];

describe("ScriptureDisplay", () => {
  beforeEach(() => {
    mockStore.fontSize = 20;
    mockStore.readingMode = "paragraph";
  });

  it("renders verses with correct font size from store", () => {
    mockStore.fontSize = 22;
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);
    const scripture = container.querySelector(".scripture") as HTMLElement;
    expect(scripture.style.fontSize).toBe("22px");
  });

  it("renders verse numbers as superscript elements", () => {
    render(<ScriptureDisplay verses={sampleVerses} />);
    const sups = screen.getAllByText("1");
    // At least one sup with verse number 1
    expect(sups.some((el) => el.tagName === "SUP")).toBe(true);
  });

  it("renders all verse texts", () => {
    render(<ScriptureDisplay verses={sampleVerses} />);
    expect(screen.getByText(/In the beginning God created/)).toBeInTheDocument();
    expect(screen.getByText(/without form, and void/)).toBeInTheDocument();
    expect(screen.getByText(/Let there be light/)).toBeInTheDocument();
  });

  it("shows empty state message when no verses provided", () => {
    render(<ScriptureDisplay verses={[]} />);
    expect(screen.getByText("No verses found for this chapter.")).toBeInTheDocument();
  });

  it("renders in paragraph mode — verses as spans within a single paragraph", () => {
    mockStore.readingMode = "paragraph";
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);

    // In paragraph mode, verses are rendered as <span> within a single <p>
    const paragraphs = container.querySelectorAll(".scripture > p");
    expect(paragraphs.length).toBe(1);
    // Each verse is a direct <span> child of the paragraph (with id="verse-N")
    const verseSpans = paragraphs[0].querySelectorAll("span[id^='verse-']");
    expect(verseSpans.length).toBe(sampleVerses.length);
  });

  it("renders in verse-per-line mode — each verse as a separate paragraph", () => {
    mockStore.readingMode = "verse-per-line";
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);

    const paragraphs = container.querySelectorAll(".scripture > p");
    expect(paragraphs.length).toBe(sampleVerses.length);
  });

  it("applies correct line-height for readability", () => {
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);
    const scripture = container.querySelector(".scripture") as HTMLElement;
    expect(scripture.className).toContain("leading-[1.9]");
  });

  it("sets verse anchor IDs for deep linking", () => {
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);
    expect(container.querySelector("#verse-1")).toBeInTheDocument();
    expect(container.querySelector("#verse-2")).toBeInTheDocument();
    expect(container.querySelector("#verse-3")).toBeInTheDocument();
  });

  it("renders with default 20px font size", () => {
    const { container } = render(<ScriptureDisplay verses={sampleVerses} />);
    const scripture = container.querySelector(".scripture") as HTMLElement;
    expect(scripture.style.fontSize).toBe("20px");
  });
});
