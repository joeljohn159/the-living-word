import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerseText } from "./VerseText";
import type { DictionaryEntry } from "@/lib/dictionary";

// Mock DictionaryTooltip to isolate VerseText behavior
vi.mock("@/components/dictionary/DictionaryTooltip", () => ({
  DictionaryTooltip: ({
    entry,
    children,
  }: {
    entry: DictionaryEntry;
    children: React.ReactNode;
  }) => (
    <span data-testid={`tooltip-${entry.slug}`} data-word={entry.word}>
      {children}
    </span>
  ),
}));

const entries: DictionaryEntry[] = [
  {
    word: "Thee",
    slug: "thee",
    definition: "Archaic form of 'you'.",
    modernEquivalent: "You",
    partOfSpeech: "pronoun",
  },
  {
    word: "Hath",
    slug: "hath",
    definition: "Archaic third person singular of 'have'.",
    modernEquivalent: "Has",
    partOfSpeech: "verb",
  },
  {
    word: "Verily",
    slug: "verily",
    definition: "In truth; certainly.",
    modernEquivalent: "Truly",
    partOfSpeech: "adverb",
  },
];

describe("VerseText", () => {
  it("renders plain text when no dictionary words match", () => {
    render(
      <VerseText text="In the beginning God created." dictionaryEntries={entries} />,
    );
    expect(screen.getByText("In the beginning God created.")).toBeInTheDocument();
  });

  it("renders without errors with empty text", () => {
    const { container } = render(
      <VerseText text="" dictionaryEntries={entries} />,
    );
    expect(container).toBeInTheDocument();
  });

  it("renders without errors with empty dictionary entries", () => {
    render(
      <VerseText text="He hath spoken." dictionaryEntries={[]} />,
    );
    expect(screen.getByText("He hath spoken.")).toBeInTheDocument();
  });

  it("wraps matched dictionary words in DictionaryTooltip", () => {
    render(
      <VerseText text="He hath spoken unto thee." dictionaryEntries={entries} />,
    );
    expect(screen.getByTestId("tooltip-hath")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-thee")).toBeInTheDocument();
  });

  it("passes the correct entry to each DictionaryTooltip", () => {
    render(
      <VerseText text="He hath spoken unto thee." dictionaryEntries={entries} />,
    );
    expect(screen.getByTestId("tooltip-hath")).toHaveAttribute("data-word", "Hath");
    expect(screen.getByTestId("tooltip-thee")).toHaveAttribute("data-word", "Thee");
  });

  it("preserves the original text around hotwords", () => {
    render(
      <VerseText text="He hath spoken unto thee." dictionaryEntries={entries} />,
    );
    // The full rendered text should still read correctly
    expect(screen.getByTestId("tooltip-hath")).toHaveTextContent("hath");
    expect(screen.getByTestId("tooltip-thee")).toHaveTextContent("thee");
  });

  it("matches words case-insensitively", () => {
    render(
      <VerseText text="VERILY I say." dictionaryEntries={entries} />,
    );
    expect(screen.getByTestId("tooltip-verily")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-verily")).toHaveTextContent("VERILY");
  });

  it("renders multiple hotwords in a single verse", () => {
    render(
      <VerseText
        text="Verily, he hath told thee."
        dictionaryEntries={entries}
      />,
    );
    expect(screen.getByTestId("tooltip-verily")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-hath")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-thee")).toBeInTheDocument();
  });

  it("does not wrap non-dictionary words", () => {
    render(
      <VerseText text="He hath spoken." dictionaryEntries={entries} />,
    );
    // "He" and "spoken" should not be wrapped in tooltips
    expect(screen.queryByTestId("tooltip-he")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-spoken")).not.toBeInTheDocument();
  });
});
