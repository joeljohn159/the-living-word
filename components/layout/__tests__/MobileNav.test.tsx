import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "../MobileNav";
import { usePreferencesStore } from "@/stores/preferences";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/bible");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  mockPathname.mockReturnValue("/bible");
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
  });
});

describe("MobileNav", () => {
  it("renders the hamburger menu trigger", () => {
    render(<MobileNav />);
    expect(
      screen.getByLabelText("Open navigation menu")
    ).toBeInTheDocument();
  });

  it("trigger button has accessible label", () => {
    render(<MobileNav />);
    const trigger = screen.getByLabelText("Open navigation menu");
    expect(trigger).toBeInTheDocument();
  });

  it("opens the slide-out drawer when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    expect(nav).toBeInTheDocument();
  });

  it("displays site title in the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    expect(within(nav).getByText("The Living Word")).toBeInTheDocument();
  });

  it("renders all nav links inside the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const expectedLinks = [
      "Bible",
      "Maps",
      "Timeline",
      "Evidence",
      "People",
      "Dictionary",
      "Plans",
      "Search",
    ];

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });

    expectedLinks.forEach((label) => {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    });
  });

  it("marks the active link with aria-current='page'", async () => {
    mockPathname.mockReturnValue("/bible");
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    const bibleLink = within(nav).getByText("Bible").closest("a");
    expect(bibleLink).toHaveAttribute("aria-current", "page");
  });

  it("does not mark inactive links with aria-current", async () => {
    mockPathname.mockReturnValue("/bible");
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    const mapsLink = within(nav).getByText("Maps").closest("a");
    expect(mapsLink).not.toHaveAttribute("aria-current");
  });

  it("renders the KJV badge inside the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    expect(screen.getByText("KJV")).toBeInTheDocument();
  });

  it("renders the theme toggle inside the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    expect(screen.getByLabelText(/current theme/i)).toBeInTheDocument();
  });

  it("has a close button in the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("renders the nav list with role='list'", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByLabelText("Open navigation menu"));

    const nav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    expect(within(nav).getByRole("list")).toBeInTheDocument();
  });
});
