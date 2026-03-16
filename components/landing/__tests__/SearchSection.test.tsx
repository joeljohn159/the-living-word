import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSection } from "../SearchSection";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
    form: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <form {...(rest as React.FormHTMLAttributes<HTMLFormElement>)}>{children}</form>;
    },
    p: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <p {...(rest as React.HTMLAttributes<HTMLParagraphElement>)}>{children}</p>;
    },
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  mockPush.mockClear();
});

describe("SearchSection", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders the section with correct aria-label", () => {
    render(<SearchSection />);
    expect(
      screen.getByRole("region", { name: /search the scriptures/i })
    ).toBeInTheDocument();
  });

  it("renders the heading", () => {
    render(<SearchSection />);
    expect(
      screen.getByRole("heading", { name: /search the scriptures/i })
    ).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<SearchSection />);
    expect(
      screen.getByText(/search across all 31,102 verses/i)
    ).toBeInTheDocument();
  });

  // ── Text contrast: CSS variables ───────────────────────────────────

  it("subtitle uses --text-secondary for readable contrast", () => {
    render(<SearchSection />);
    const subtitle = screen.getByText(/search across all 31,102 verses/i);
    expect(subtitle.className).toContain("var(--text-secondary)");
  });

  it("placeholder text uses --text-muted CSS variable", () => {
    render(<SearchSection />);
    const input = screen.getByLabelText("Search the Bible");
    expect(input.className).toContain("var(--text-muted)");
  });

  it("hint text uses --text-muted CSS variable", () => {
    render(<SearchSection />);
    const hint = screen.getByText(/try/i);
    expect(hint.className).toContain("var(--text-muted)");
  });

  it("input text uses --text-primary for typed content", () => {
    render(<SearchSection />);
    const input = screen.getByLabelText("Search the Bible");
    expect(input.className).toContain("var(--text-primary)");
  });

  it("heading uses text-gold class", () => {
    render(<SearchSection />);
    const heading = screen.getByRole("heading", {
      name: /search the scriptures/i,
    });
    expect(heading.className).toContain("text-gold");
  });

  // ── Search input ───────────────────────────────────────────────────

  it("renders the search input with correct placeholder", () => {
    render(<SearchSection />);
    expect(
      screen.getByPlaceholderText(/search verses, books, or topics/i)
    ).toBeInTheDocument();
  });

  it("has accessible label on the search input", () => {
    render(<SearchSection />);
    expect(screen.getByLabelText("Search the Bible")).toBeInTheDocument();
  });

  // ── Search behavior ────────────────────────────────────────────────

  it("navigates to search results on form submit", async () => {
    const user = userEvent.setup();
    render(<SearchSection />);

    const input = screen.getByLabelText("Search the Bible");
    await user.type(input, "love");
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/search?q=love");
  });

  it("trims whitespace from search query", async () => {
    const user = userEvent.setup();
    render(<SearchSection />);

    const input = screen.getByLabelText("Search the Bible");
    await user.type(input, "  psalm 23  ");
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/search?q=psalm%2023");
  });

  it("does not navigate on empty search", async () => {
    const user = userEvent.setup();
    render(<SearchSection />);

    const input = screen.getByLabelText("Search the Bible");
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate on whitespace-only search", async () => {
    const user = userEvent.setup();
    render(<SearchSection />);

    const input = screen.getByLabelText("Search the Bible");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("encodes special characters in search query", async () => {
    const user = userEvent.setup();
    render(<SearchSection />);

    const input = screen.getByLabelText("Search the Bible");
    await user.type(input, "God & love");
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/search?q=God%20%26%20love");
  });

  // ── Keyboard shortcut hint ─────────────────────────────────────────

  it("renders the keyboard shortcut hint '/'", () => {
    render(<SearchSection />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("keyboard shortcut hint uses --text-muted for styling", () => {
    render(<SearchSection />);
    const kbd = screen.getByText("/");
    expect(kbd.className).toContain("var(--text-muted)");
  });
});
