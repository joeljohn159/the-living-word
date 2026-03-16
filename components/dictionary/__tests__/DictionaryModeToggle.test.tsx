import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryModeToggle } from "../DictionaryModeToggle";
import { usePreferencesStore } from "@/stores/preferences";

// Mock lucide-react to avoid SVG rendering issues
vi.mock("lucide-react", () => ({
  BookOpen: (props: Record<string, unknown>) => (
    <svg data-testid="book-open-icon" {...props} />
  ),
}));

describe("DictionaryModeToggle", () => {
  beforeEach(() => {
    usePreferencesStore.setState({ dictionaryMode: false });
  });

  it("renders a button with the book icon", () => {
    render(<DictionaryModeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByTestId("book-open-icon")).toBeInTheDocument();
  });

  it("shows 'Enter dictionary mode' label when mode is off", () => {
    render(<DictionaryModeToggle />);
    expect(
      screen.getByRole("button", { name: "Enter dictionary mode" }),
    ).toBeInTheDocument();
  });

  it("shows 'Exit dictionary mode' label when mode is on", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeToggle />);
    expect(
      screen.getByRole("button", { name: "Exit dictionary mode" }),
    ).toBeInTheDocument();
  });

  it("has aria-pressed=false when mode is off", () => {
    render(<DictionaryModeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-pressed=true when mode is on", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles dictionary mode on click", async () => {
    const user = userEvent.setup();
    render(<DictionaryModeToggle />);

    await user.click(screen.getByRole("button"));
    expect(usePreferencesStore.getState().dictionaryMode).toBe(true);

    await user.click(screen.getByRole("button"));
    expect(usePreferencesStore.getState().dictionaryMode).toBe(false);
  });

  it("updates aria-label after toggling", async () => {
    const user = userEvent.setup();
    render(<DictionaryModeToggle />);

    expect(
      screen.getByRole("button", { name: "Enter dictionary mode" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: "Exit dictionary mode" }),
    ).toBeInTheDocument();
  });
});
