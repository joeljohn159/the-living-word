import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DictionaryModeBadge } from "../DictionaryModeBadge";
import { usePreferencesStore } from "@/stores/preferences";

// Mock framer-motion to render elements synchronously
vi.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, initial, animate, exit, transition, ...htmlProps }: React.PropsWithChildren<Record<string, unknown>>) => {
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  BookOpen: (props: Record<string, unknown>) => (
    <svg data-testid="badge-book-icon" {...props} />
  ),
}));

describe("DictionaryModeBadge", () => {
  beforeEach(() => {
    usePreferencesStore.setState({ dictionaryMode: false });
  });

  it("does not render when dictionary mode is off", () => {
    render(<DictionaryModeBadge />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Dictionary Mode ON")).not.toBeInTheDocument();
  });

  it("renders the badge when dictionary mode is on", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeBadge />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Dictionary Mode ON")).toBeInTheDocument();
  });

  it("includes exit instructions text", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeBadge />);
    expect(
      screen.getByText("— press D or Esc to exit"),
    ).toBeInTheDocument();
  });

  it("has aria-live=polite for screen readers", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeBadge />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("shows the book icon when active", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    render(<DictionaryModeBadge />);
    expect(screen.getByTestId("badge-book-icon")).toBeInTheDocument();
  });

  it("hides when dictionary mode is turned off", () => {
    usePreferencesStore.setState({ dictionaryMode: true });
    const { rerender } = render(<DictionaryModeBadge />);
    expect(screen.getByText("Dictionary Mode ON")).toBeInTheDocument();

    usePreferencesStore.setState({ dictionaryMode: false });
    rerender(<DictionaryModeBadge />);
    expect(screen.queryByText("Dictionary Mode ON")).not.toBeInTheDocument();
  });
});
