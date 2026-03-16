import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryTooltip } from "../DictionaryTooltip";
import type { DictionaryEntry } from "@/lib/dictionary";

// Mock DictionaryBottomSheet
vi.mock("../DictionaryBottomSheet", () => ({
  DictionaryBottomSheet: ({
    entry,
    onClose,
  }: {
    entry: DictionaryEntry;
    onClose: () => void;
  }) => (
    <div data-testid="bottom-sheet" role="dialog">
      <span>{entry.word}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const entry: DictionaryEntry = {
  word: "Thee",
  slug: "thee",
  definition: "Archaic form of 'you' (objective case).",
  modernEquivalent: "You",
  partOfSpeech: "pronoun",
};

const entryWithoutModern: DictionaryEntry = {
  word: "Selah",
  slug: "selah",
  definition: "A term of uncertain meaning found in Psalms.",
  modernEquivalent: null,
  partOfSpeech: null,
};

function mockDesktopMediaQuery() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, // desktop
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mockMobileMediaQuery() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true, // mobile
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("DictionaryTooltip", () => {
  beforeEach(() => {
    mockDesktopMediaQuery();
  });

  it("renders the children text", () => {
    render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
    expect(screen.getByText("thee")).toBeInTheDocument();
  });

  it("renders with correct aria-label for accessibility", () => {
    render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
    expect(screen.getByRole("button", { name: "Dictionary word: Thee" })).toBeInTheDocument();
  });

  it("sets data-dictionary-word attribute with the entry slug", () => {
    render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
    const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
    expect(trigger).toHaveAttribute("data-dictionary-word", "thee");
  });

  it("has tabIndex=0 for keyboard accessibility", () => {
    render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
    const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
    expect(trigger).toHaveAttribute("tabIndex", "0");
  });

  describe("Desktop — hover tooltip", () => {
    beforeEach(() => {
      mockDesktopMediaQuery();
    });

    it("does not show tooltip by default", () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("shows tooltip on mouse enter", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("hides tooltip on mouse leave", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      fireEvent.mouseLeave(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("shows tooltip on focus", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.focus(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("hides tooltip on blur", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.focus(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      fireEvent.blur(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("displays the word in the tooltip", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveTextContent("Thee");
    });

    it("displays the definition in the tooltip", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Archaic form of 'you' (objective case).",
      );
    });

    it("displays the modern equivalent when available", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toHaveTextContent("You");
    });

    it("displays part of speech when available", async () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toHaveTextContent("pronoun");
    });

    it("omits modern equivalent when null", async () => {
      render(
        <DictionaryTooltip entry={entryWithoutModern}>selah</DictionaryTooltip>,
      );
      const trigger = screen.getByText("selah").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).not.toHaveTextContent("Modern:");
    });

    it("does not show bottom sheet on desktop click", async () => {
      const user = userEvent.setup();
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      await user.click(trigger);
      expect(screen.queryByTestId("bottom-sheet")).not.toBeInTheDocument();
    });
  });

  describe("Mobile — bottom sheet", () => {
    beforeEach(() => {
      mockMobileMediaQuery();
    });

    it("does not show tooltip on hover on mobile", () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByText("thee").closest("span.relative")!;
      fireEvent.mouseEnter(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("opens bottom sheet on tap (click)", async () => {
      const user = userEvent.setup();
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      await user.click(trigger);
      expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
    });

    it("opens bottom sheet on Enter key press", () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
    });

    it("opens bottom sheet on Space key press", () => {
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      fireEvent.keyDown(trigger, { key: " " });
      expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
    });

    it("closes bottom sheet via close callback", async () => {
      const user = userEvent.setup();
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      await user.click(trigger);
      expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
      await user.click(screen.getByText("Close"));
      expect(screen.queryByTestId("bottom-sheet")).not.toBeInTheDocument();
    });

    it("closes bottom sheet on Escape key", async () => {
      const user = userEvent.setup();
      render(<DictionaryTooltip entry={entry}>thee</DictionaryTooltip>);
      const trigger = screen.getByRole("button", { name: "Dictionary word: Thee" });
      await user.click(trigger);
      expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByTestId("bottom-sheet")).not.toBeInTheDocument();
    });
  });
});
