import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { DictionaryModeProvider } from "../DictionaryModeProvider";
import { usePreferencesStore } from "@/stores/preferences";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, initial, animate, exit, transition, ...htmlProps }: React.PropsWithChildren<Record<string, unknown>>) => {
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aside: ({ children, initial, animate, exit, transition, ...htmlProps }: React.PropsWithChildren<Record<string, unknown>>) => {
      return <aside {...(htmlProps as React.HTMLAttributes<HTMLElement>)}>{children}</aside>;
    },
  },
  AnimatePresence: ({
    children,
  }: React.PropsWithChildren<{ mode?: string }>) => <>{children}</>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  BookOpen: (props: Record<string, unknown>) => <svg data-testid="book-icon" {...props} />,
  X: (props: Record<string, unknown>) => <svg data-testid="close-icon" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => <svg data-testid="arrow-icon" {...props} />,
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

describe("DictionaryModeProvider", () => {
  beforeEach(() => {
    usePreferencesStore.setState({ dictionaryMode: false });
    document.documentElement.classList.remove("dictionary-mode");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dictionary-mode");
  });

  it("renders the badge component", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeProvider />);
    expect(screen.getByText("Dictionary Mode ON")).toBeInTheDocument();
  });

  it("does not show badge when dictionary mode is off", () => {
    render(<DictionaryModeProvider />);
    expect(screen.queryByText("Dictionary Mode ON")).not.toBeInTheDocument();
  });

  it("adds dictionary-mode class to <html> when active", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeProvider />);
    expect(document.documentElement.classList.contains("dictionary-mode")).toBe(
      true,
    );
  });

  it("removes dictionary-mode class from <html> when deactivated", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    const { rerender } = render(<DictionaryModeProvider />);
    expect(document.documentElement.classList.contains("dictionary-mode")).toBe(
      true,
    );

    act(() => {
      usePreferencesStore.setState({ dictionaryMode: false });
    });
    rerender(<DictionaryModeProvider />);

    expect(document.documentElement.classList.contains("dictionary-mode")).toBe(
      false,
    );
  });

  it("cleans up dictionary-mode class on unmount", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    const { unmount } = render(<DictionaryModeProvider />);
    expect(document.documentElement.classList.contains("dictionary-mode")).toBe(
      true,
    );

    unmount();
    expect(document.documentElement.classList.contains("dictionary-mode")).toBe(
      false,
    );
  });

  it("responds to D key toggle via the keyboard hook", () => {
    render(<DictionaryModeProvider />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
    });

    expect(usePreferencesStore.getState().dictionaryMode).toBe(true);
    expect(screen.getByText("Dictionary Mode ON")).toBeInTheDocument();
  });

  it("opens dictionary panel when a dictionary word is clicked", async () => {
    usePreferencesStore.setState({ dictionaryMode: true });

    // Mock fetch to return a dictionary entry
    const mockEntry = {
      word: "Thou",
      slug: "thou",
      definition: "Second person singular pronoun.",
      modernEquivalent: "You",
      partOfSpeech: "pronoun",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEntry),
    });

    render(<DictionaryModeProvider />);

    // Create a clickable dictionary word element
    const wordEl = document.createElement("span");
    wordEl.setAttribute("data-dictionary-word", "thou");
    wordEl.textContent = "thou";
    document.body.appendChild(wordEl);

    act(() => {
      wordEl.click();
    });

    await waitFor(() => {
      expect(screen.getByText("Thou")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/dictionary/thou");

    document.body.removeChild(wordEl);
  });

  it("does not fetch when clicking non-dictionary elements", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    global.fetch = vi.fn();

    render(<DictionaryModeProvider />);

    const plainEl = document.createElement("span");
    plainEl.textContent = "plain text";
    document.body.appendChild(plainEl);

    act(() => {
      plainEl.click();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    document.body.removeChild(plainEl);
  });

  it("handles fetch failure gracefully (no panel opens)", async () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<DictionaryModeProvider />);

    const wordEl = document.createElement("span");
    wordEl.setAttribute("data-dictionary-word", "badword");
    document.body.appendChild(wordEl);

    act(() => {
      wordEl.click();
    });

    // Wait a tick for async to resolve
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/dictionary/badword");
    });

    // Panel should not appear for a failed fetch
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    document.body.removeChild(wordEl);
  });

  it("handles network error gracefully", async () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<DictionaryModeProvider />);

    const wordEl = document.createElement("span");
    wordEl.setAttribute("data-dictionary-word", "error-word");
    document.body.appendChild(wordEl);

    act(() => {
      wordEl.click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    document.body.removeChild(wordEl);
  });

  it("clears selected entry when dictionary mode is turned off", async () => {
    usePreferencesStore.setState({ dictionaryMode: true });

    const mockEntry = {
      word: "Thou",
      slug: "thou",
      definition: "Second person singular pronoun.",
      modernEquivalent: "You",
      partOfSpeech: "pronoun",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEntry),
    });

    render(<DictionaryModeProvider />);

    // Click a dictionary word to open panel
    const wordEl = document.createElement("span");
    wordEl.setAttribute("data-dictionary-word", "thou");
    document.body.appendChild(wordEl);

    act(() => {
      wordEl.click();
    });

    await waitFor(() => {
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    // Turn off dictionary mode
    act(() => {
      usePreferencesStore.setState({ dictionaryMode: false });
    });

    await waitFor(() => {
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    document.body.removeChild(wordEl);
  });
});
