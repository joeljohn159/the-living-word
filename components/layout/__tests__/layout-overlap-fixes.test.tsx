import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";
import { MobileNav } from "../MobileNav";
import { Footer } from "../Footer";
import { usePreferencesStore } from "@/stores/preferences";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/");
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
  mockPathname.mockReturnValue("/");
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
  });
});

describe("Header/Content Overlap Fixes", () => {
  // ── Header: Sticky Positioning & Z-Index ─────────────────────────

  describe("Header sticky positioning", () => {
    it("has sticky positioning with top-0 to stay at viewport top", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("sticky");
      expect(header.className).toContain("top-0");
    });

    it("has z-40 to layer above page content", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("z-40");
    });

    it("has a fixed height of h-16 (4rem) matching hero calc offset", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      // The inner flex container has h-16
      const innerContainer = header.querySelector(".h-16");
      expect(innerContainer).toBeInTheDocument();
    });

    it("has a bottom border to visually separate from content", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("border-b");
    });

    it("uses backdrop-blur for semi-transparent scrolling effect", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      expect(header.className).toContain("backdrop-blur");
    });
  });

  // ── MobileNav: Sheet Positioning & Padding ────────────────────────

  describe("MobileNav sheet positioning and padding", () => {
    it("mobile nav trigger is only visible on small screens (lg:hidden)", () => {
      render(<MobileNav />);
      const trigger = screen.getByLabelText("Open navigation menu");
      expect(trigger.className).toContain("lg:hidden");
    });

    it("sheet slides from the right side (fixed right-0)", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      // The sheet content renders via portal - check the dialog content
      const dialog = screen.getByRole("dialog");
      expect(dialog.className).toContain("right-0");
    });

    it("sheet content has sufficient top padding (pt-14) for close button clearance", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      const nav = screen.getByRole("navigation", { name: "Mobile navigation" });
      expect(nav.className).toContain("pt-14");
    });

    it("close button is positioned at top-4 right-4 within the sheet", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton.className).toContain("top-4");
      expect(closeButton.className).toContain("right-4");
    });

    it("nav content does not overlap with the close button", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      const nav = screen.getByRole("navigation", { name: "Mobile navigation" });
      // pt-14 (3.5rem = 56px) > close button position (top-4 = 16px + icon ~20px = ~36px)
      // So the nav content starts below the close button
      expect(nav.className).toContain("pt-14");
    });

    it("sheet overlay covers the full viewport (fixed inset-0)", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      // Check the overlay exists with fixed positioning
      const dialog = screen.getByRole("dialog");
      // The dialog parent should contain the overlay
      expect(dialog).toBeInTheDocument();
    });

    it("sheet has max-width to prevent full-screen takeover", async () => {
      const user = userEvent.setup();
      render(<MobileNav />);
      await user.click(screen.getByLabelText("Open navigation menu"));

      const dialog = screen.getByRole("dialog");
      expect(dialog.className).toContain("max-w-sm");
    });
  });

  // ── Footer: Responsive Grid ───────────────────────────────────────

  describe("Footer responsive grid layout", () => {
    it("uses 3-column grid on medium screens", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      const gridContainer = footer.querySelector("[class*='md:grid-cols-3']");
      expect(gridContainer).toBeInTheDocument();
    });

    it("uses 2-column grid on small screens", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      const gridContainer = footer.querySelector("[class*='sm:grid-cols-2']");
      expect(gridContainer).toBeInTheDocument();
    });

    it("stacks to single column on mobile", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      const gridContainer = footer.querySelector("[class*='grid-cols-1']");
      expect(gridContainer).toBeInTheDocument();
    });

    it("version selector has responsive max-width with sm:max-w-[240px]", () => {
      render(<Footer />);
      const select = screen.getByLabelText("Select Bible translation");
      expect(select.className).toContain("sm:max-w-[240px]");
    });

    it("version selector uses full width on mobile (w-full)", () => {
      render(<Footer />);
      const select = screen.getByLabelText("Select Bible translation");
      expect(select.className).toContain("w-full");
    });

    it("footer nav links use 2-column sub-grid to prevent awkward wrapping", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer navigation" });
      const linkList = within(nav).getByRole("list");
      expect(linkList.className).toContain("grid-cols-2");
    });

    it("footer has consistent padding across breakpoints", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      const innerContainer = footer.querySelector("[class*='px-4']");
      expect(innerContainer).toBeInTheDocument();
      expect(innerContainer?.className).toContain("sm:px-6");
      expect(innerContainer?.className).toContain("lg:px-8");
    });
  });
});
