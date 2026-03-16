import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Header } from "../Header";
import { usePreferencesStore } from "@/stores/preferences";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/bible");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

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

describe("Header", () => {
  it("renders without errors", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("displays the site title 'The Living Word'", () => {
    render(<Header />);
    const logo = screen.getByLabelText("The Living Word — Home");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent("The Living Word");
  });

  it("links the logo to the home page", () => {
    render(<Header />);
    const logo = screen.getByLabelText("The Living Word — Home");
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders the main navigation with correct aria-label", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeInTheDocument();
  });

  it("renders all expected navigation links", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
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

    expectedLinks.forEach((label) => {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    });
  });

  it("marks the active nav link with aria-current='page'", () => {
    mockPathname.mockReturnValue("/bible");
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const bibleLink = within(nav).getByText("Bible").closest("a");
    expect(bibleLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current on inactive links", () => {
    mockPathname.mockReturnValue("/bible");
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const mapsLink = within(nav).getByText("Maps").closest("a");
    expect(mapsLink).not.toHaveAttribute("aria-current");
  });

  it("updates active state when pathname changes", () => {
    mockPathname.mockReturnValue("/maps");
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const mapsLink = within(nav).getByText("Maps").closest("a");
    const bibleLink = within(nav).getByText("Bible").closest("a");
    expect(mapsLink).toHaveAttribute("aria-current", "page");
    expect(bibleLink).not.toHaveAttribute("aria-current");
  });

  it("marks sub-paths as active (e.g. /bible/genesis)", () => {
    mockPathname.mockReturnValue("/bible/genesis/1");
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const bibleLink = within(nav).getByText("Bible").closest("a");
    expect(bibleLink).toHaveAttribute("aria-current", "page");
  });

  it("renders the KJV badge", () => {
    render(<Header />);
    expect(screen.getByText("KJV")).toBeInTheDocument();
  });

  it("renders the mobile nav hamburger button", () => {
    render(<Header />);
    expect(
      screen.getByLabelText("Open navigation menu")
    ).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<Header />);
    expect(
      screen.getByLabelText(/current theme/i)
    ).toBeInTheDocument();
  });

  it("renders with sticky positioning", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
  });
});
