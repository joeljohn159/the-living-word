import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryBottomSheet } from "../DictionaryBottomSheet";
import type { DictionaryEntry } from "@/lib/dictionary";

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  X: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg data-testid="arrow-right-icon" className={className} />
  ),
}));

const fullEntry: DictionaryEntry = {
  word: "Thee",
  slug: "thee",
  definition: "Archaic form of 'you' (objective case).",
  modernEquivalent: "You",
  partOfSpeech: "pronoun",
};

const minimalEntry: DictionaryEntry = {
  word: "Selah",
  slug: "selah",
  definition: "A term of uncertain meaning found in Psalms.",
  modernEquivalent: null,
  partOfSpeech: null,
};

describe("DictionaryBottomSheet", () => {
  it("renders as a dialog with correct aria attributes", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Definition of Thee");
  });

  it("displays the word title", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Thee")).toBeInTheDocument();
  });

  it("displays the definition", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    expect(
      screen.getByText("Archaic form of 'you' (objective case)."),
    ).toBeInTheDocument();
  });

  it("displays part of speech when available", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    expect(screen.getByText("pronoun")).toBeInTheDocument();
  });

  it("omits part of speech when null", () => {
    render(<DictionaryBottomSheet entry={minimalEntry} onClose={vi.fn()} />);
    expect(screen.queryByText("pronoun")).not.toBeInTheDocument();
  });

  it("displays modern equivalent when available", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("omits modern equivalent section when null", () => {
    render(<DictionaryBottomSheet entry={minimalEntry} onClose={vi.fn()} />);
    expect(screen.queryByText(/Modern equivalent/)).not.toBeInTheDocument();
  });

  it("has a link to the full dictionary entry page", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    const link = screen.getByText("View full entry").closest("a");
    expect(link).toHaveAttribute("href", "/dictionary/thee");
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<DictionaryBottomSheet entry={fullEntry} onClose={onClose} />);
    await user.click(screen.getByLabelText("Close definition"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<DictionaryBottomSheet entry={fullEntry} onClose={onClose} />);
    // Click the dialog backdrop (outermost element)
    const dialog = screen.getByRole("dialog");
    await user.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when the sheet content is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<DictionaryBottomSheet entry={fullEntry} onClose={onClose} />);
    // Click the definition text (inside the sheet content)
    await user.click(screen.getByText("Archaic form of 'you' (objective case)."));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders close button with accessible label", () => {
    render(<DictionaryBottomSheet entry={fullEntry} onClose={vi.fn()} />);
    expect(screen.getByLabelText("Close definition")).toBeInTheDocument();
  });

  it("renders for entry with all null optional fields", () => {
    render(<DictionaryBottomSheet entry={minimalEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Selah")).toBeInTheDocument();
    expect(
      screen.getByText("A term of uncertain meaning found in Psalms."),
    ).toBeInTheDocument();
    // Link should use slug
    const link = screen.getByText("View full entry").closest("a");
    expect(link).toHaveAttribute("href", "/dictionary/selah");
  });
});
