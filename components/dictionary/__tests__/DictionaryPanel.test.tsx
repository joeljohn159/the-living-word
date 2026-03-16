import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryPanel } from "../DictionaryPanel";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    aside: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, ...htmlProps } =
        props as Record<string, unknown>;
      return <aside {...(htmlProps as React.HTMLAttributes<HTMLElement>)}>{children}</aside>;
    },
  },
  AnimatePresence: ({
    children,
  }: React.PropsWithChildren<{ mode?: string }>) => <>{children}</>,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  X: (props: Record<string, unknown>) => <svg data-testid="close-icon" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => (
    <svg data-testid="arrow-icon" {...props} />
  ),
  BookOpen: (props: Record<string, unknown>) => (
    <svg data-testid="book-icon" {...props} />
  ),
}));

const fullEntry = {
  word: "Thou",
  slug: "thou",
  definition: "Archaic second person singular pronoun.",
  modernEquivalent: "You",
  partOfSpeech: "pronoun",
  pronunciation: "/ðaʊ/",
  usageNotes: "Used as the subject form, while 'thee' is the object form.",
  exampleVerse: {
    text: "Thou shalt not kill.",
    bookName: "Exodus",
    chapterNumber: 20,
    verseNumber: 13,
    bookSlug: "exodus",
  },
};

const minimalEntry = {
  word: "Selah",
  slug: "selah",
  definition: "A term of uncertain meaning found in Psalms.",
  modernEquivalent: null,
  partOfSpeech: null,
  pronunciation: null,
  usageNotes: null,
  exampleVerse: null,
};

describe("DictionaryPanel", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it("does not render when entry is null", () => {
    render(<DictionaryPanel entry={null} onClose={onClose} />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  describe("with a full entry", () => {
    it("renders the panel with complementary role", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("has an accessible label with the word name", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(
        screen.getByRole("complementary", { name: "Dictionary entry: Thou" }),
      ).toBeInTheDocument();
    });

    it("displays the word", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("Thou")).toBeInTheDocument();
    });

    it("displays the pronunciation", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("/ðaʊ/")).toBeInTheDocument();
    });

    it("displays the definition", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(
        screen.getByText("Archaic second person singular pronoun."),
      ).toBeInTheDocument();
    });

    it("displays the modern equivalent", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("Modern Equivalent")).toBeInTheDocument();
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("displays the part of speech", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("Part of Speech")).toBeInTheDocument();
      expect(screen.getByText("pronoun")).toBeInTheDocument();
    });

    it("displays usage notes", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("Usage Notes")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Used as the subject form, while 'thee' is the object form.",
        ),
      ).toBeInTheDocument();
    });

    it("displays the example verse with reference", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(screen.getByText("Example Verse")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Thou shalt not kill\./,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/Exodus 20:13/)).toBeInTheDocument();
    });

    it("renders a 'See in Dictionary' link with correct href", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      const link = screen.getByText("See in Dictionary");
      expect(link.closest("a")).toHaveAttribute("href", "/dictionary/thou");
    });

    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);

      await user.click(
        screen.getByRole("button", { name: "Close dictionary panel" }),
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("has an accessible close button", () => {
      render(<DictionaryPanel entry={fullEntry} onClose={onClose} />);
      expect(
        screen.getByRole("button", { name: "Close dictionary panel" }),
      ).toBeInTheDocument();
    });
  });

  describe("with a minimal entry (null optional fields)", () => {
    it("renders the word and definition", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      expect(screen.getByText("Selah")).toBeInTheDocument();
      expect(
        screen.getByText("A term of uncertain meaning found in Psalms."),
      ).toBeInTheDocument();
    });

    it("does not render pronunciation when null", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      // Pronunciation would be italic text — just ensure no extra text appears
      const panel = screen.getByRole("complementary");
      expect(panel).not.toHaveTextContent("/");
    });

    it("does not render part of speech section when null", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      expect(screen.queryByText("Part of Speech")).not.toBeInTheDocument();
    });

    it("does not render modern equivalent section when null", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      expect(screen.queryByText("Modern Equivalent")).not.toBeInTheDocument();
    });

    it("does not render usage notes section when null", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      expect(screen.queryByText("Usage Notes")).not.toBeInTheDocument();
    });

    it("does not render example verse section when null", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      expect(screen.queryByText("Example Verse")).not.toBeInTheDocument();
    });

    it("still renders the dictionary link", () => {
      render(<DictionaryPanel entry={minimalEntry} onClose={onClose} />);
      const link = screen.getByText("See in Dictionary");
      expect(link.closest("a")).toHaveAttribute("href", "/dictionary/selah");
    });
  });
});
