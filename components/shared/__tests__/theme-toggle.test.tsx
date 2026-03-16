import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";
import { usePreferencesStore } from "@/stores/preferences";

beforeEach(() => {
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
  });
});

describe("ThemeToggle", () => {
  it("renders a button element", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows the current theme label for dark theme", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("has accessible aria-label describing current theme", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Current theme: Dark. Press to switch theme."
    );
  });

  it("has a title with keyboard hint", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Theme: Dark (T)");
  });

  it("shows the keyboard shortcut indicator", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("cycles theme from dark to light on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(usePreferencesStore.getState().theme).toBe("light");
  });

  it("cycles through all three themes on successive clicks", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    // dark -> light
    await user.click(button);
    expect(usePreferencesStore.getState().theme).toBe("light");

    // light -> sepia
    await user.click(button);
    expect(usePreferencesStore.getState().theme).toBe("sepia");

    // sepia -> dark
    await user.click(button);
    expect(usePreferencesStore.getState().theme).toBe("dark");
  });

  it("updates aria-label when theme changes", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Current theme: Light. Press to switch theme."
    );
  });

  it("updates displayed label when theme changes", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Light")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    render(<ThemeToggle className="my-custom-class" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("my-custom-class");
  });

  it("renders with sepia theme state correctly", () => {
    usePreferencesStore.setState({ theme: "sepia" });
    render(<ThemeToggle />);

    expect(screen.getByText("Sepia")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Current theme: Sepia. Press to switch theme."
    );
  });
});
