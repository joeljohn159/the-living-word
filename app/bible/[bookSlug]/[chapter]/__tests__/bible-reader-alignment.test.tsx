import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChapterToolbar } from "../ChapterToolbar";
import { ChapterNavigation } from "@/components/scripture/ChapterNavigation";
import type { ChapterNavLink } from "@/components/scripture/ChapterNavigation";
import { ContextPanel } from "@/components/scripture/ContextPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { DictionaryTooltip } from "@/components/dictionary/DictionaryTooltip";
import { CrossRefPopover } from "@/components/scripture/CrossRefPopover";
import { usePreferencesStore } from "@/stores/preferences";
import { useCrossRefStore } from "@/stores/cross-references";
import type { DictionaryEntry } from "@/lib/dictionary";
import type { ChapterCrossRef } from "@/stores/cross-references";

// ─── Mocks ──────────────────────────────────────────────────

// Mock next/link
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

// Mock child components used by ChapterToolbar
vi.mock("@/components/scripture/FontSizeControls", () => ({
  FontSizeControls: () => <div data-testid="font-size-controls">FontSize</div>,
}));

vi.mock("@/components/scripture/ReadingModeToggle", () => ({
  ReadingModeToggle: () => (
    <div data-testid="reading-mode-toggle">ReadingMode</div>
  ),
}));

vi.mock("@/components/dictionary/DictionaryModeToggle", () => ({
  DictionaryModeToggle: () => (
    <div data-testid="dictionary-mode-toggle">DictMode</div>
  ),
}));

// Mock DictionaryBottomSheet
vi.mock("@/components/dictionary/DictionaryBottomSheet", () => ({
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

// Mock media components for ContextPanel
vi.mock("@/components/media/MediaGallery", () => ({
  MediaGallery: () => <div data-testid="media-gallery">Gallery</div>,
}));

vi.mock("@/components/people/PeopleTabContent", () => ({
  PeopleTabContent: () => <div data-testid="people-tab">People</div>,
}));

vi.mock("@/components/scripture/CrossRefTab", () => ({
  CrossRefTab: () => <div data-testid="crossref-tab">CrossRefs</div>,
}));

// Media query control
let mockIsMobileContextPanel = false;
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: () => mockIsMobileContextPanel,
}));

// Mock framer-motion for Sidebar
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    aside: ({
      children,
      className,
      role,
      "aria-label": ariaLabel,
    }: Record<string, unknown>) => (
      <aside
        className={className as string}
        role={role as string}
        aria-label={ariaLabel as string}
      >
        {children as React.ReactNode}
      </aside>
    ),
    div: ({ children, className }: Record<string, unknown>) => (
      <div className={className as string}>{children as React.ReactNode}</div>
    ),
  },
}));

// Mock Sheet for Sidebar mobile
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="mobile-sheet">{children}</div> : null),
  SheetContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="sheet-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock ContextPanelContent for Sidebar
vi.mock("@/components/layout/ContextPanelContent", () => ({
  ContextPanelContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="context-panel-content">{activeTab}</div>
  ),
}));

// ─── Test Data ──────────────────────────────────────────────

const prevLink: ChapterNavLink = {
  bookSlug: "genesis",
  bookName: "Genesis",
  chapter: 2,
};

const nextLink: ChapterNavLink = {
  bookSlug: "genesis",
  bookName: "Genesis",
  chapter: 4,
};

const dictEntry: DictionaryEntry = {
  word: "Thee",
  slug: "thee",
  definition: "Archaic form of 'you' (objective case).",
  modernEquivalent: "You",
  partOfSpeech: "pronoun",
};

function makeRef(id: number): ChapterCrossRef {
  return {
    id,
    sourceVerseId: 100,
    sourceVerseNumber: 5,
    targetBook: "Romans",
    targetBookSlug: "romans",
    targetChapter: 3,
    targetVerse: id,
    targetText: `Verse text for Romans 3:${id}`,
    relationship: "parallel",
    note: null,
  };
}

function resetStores(overrides: Record<string, unknown> = {}) {
  usePreferencesStore.setState({
    theme: "dark",
    fontSize: 20,
    readingMode: "paragraph",
    sidebarOpen: true,
    activeSidebarTab: "visuals",
    dictionaryMode: false,
    ...overrides,
  });
}

function mockDesktopMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
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

function mockMobileMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
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

// ─── ChapterToolbar Alignment ───────────────────────────────

describe("ChapterToolbar — layout and alignment", () => {
  it("renders all three control groups without errors", () => {
    render(<ChapterToolbar />);
    expect(screen.getByTestId("reading-mode-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("dictionary-mode-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("font-size-controls")).toBeInTheDocument();
  });

  it("uses flex-wrap so controls wrap on narrow screens instead of overflowing", () => {
    const { container } = render(<ChapterToolbar />);
    const toolbar = container.querySelector("[class*='flex']");
    expect(toolbar).toBeInTheDocument();
    expect(toolbar!.className).toContain("flex-wrap");
  });

  it("constrains toolbar width with max-w-2xl to match content area", () => {
    const { container } = render(<ChapterToolbar />);
    const outer = container.firstElementChild;
    expect(outer!.className).toContain("max-w-2xl");
    expect(outer!.className).toContain("mx-auto");
  });

  it("uses justify-between to separate left and right controls", () => {
    const { container } = render(<ChapterToolbar />);
    const toolbar = container.querySelector("[class*='justify-between']");
    expect(toolbar).toBeInTheDocument();
  });

  it("has gap-2 to prevent controls from touching when wrapping", () => {
    const { container } = render(<ChapterToolbar />);
    const toolbar = container.querySelector("[class*='gap-2']");
    expect(toolbar).toBeInTheDocument();
  });

  it("has consistent horizontal padding matching content area", () => {
    const { container } = render(<ChapterToolbar />);
    const outer = container.firstElementChild;
    expect(outer!.className).toContain("px-4");
    expect(outer!.className).toContain("sm:px-6");
    expect(outer!.className).toContain("lg:px-8");
  });

  it("groups dictionary toggle and font controls together on the right", () => {
    const { container } = render(<ChapterToolbar />);
    const rightGroup = screen
      .getByTestId("dictionary-mode-toggle")
      .closest("[class*='flex'][class*='items-center']");
    expect(rightGroup).toBeInTheDocument();
    // Both should be in the same parent
    expect(
      within(rightGroup! as HTMLElement).getByTestId("font-size-controls")
    ).toBeInTheDocument();
    expect(
      within(rightGroup! as HTMLElement).getByTestId("dictionary-mode-toggle")
    ).toBeInTheDocument();
  });
});

// ─── ContextPanel Desktop Alignment ─────────────────────────

describe("ContextPanel — desktop layout alignment", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = false;
    resetStores();
  });

  it("renders as a flex-col aside when open on desktop", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.tagName).toBe("ASIDE");
    expect(aside.className).toContain("flex-col");
  });

  it("uses responsive widths: w-72 on lg, w-80 on xl, w-96 on 2xl", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("w-72");
    expect(aside.className).toContain("xl:w-80");
    expect(aside.className).toContain("2xl:w-96");
  });

  it("uses shrink-0 to prevent the sidebar from being compressed by main content", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("shrink-0");
  });

  it("collapses to w-12 rail when closed", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("w-12");
  });

  it("is hidden on mobile (hidden lg:flex)", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("hidden");
    expect(aside.className).toContain("lg:flex");
  });

  it("has overflow-hidden to prevent content from spilling out of panel", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("overflow-hidden");
  });

  it("uses transition-all for smooth open/close without layout jumps", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("transition-all");
    expect(aside.className).toContain("duration-300");
  });

  it("has a left border to visually separate from main content", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    expect(aside.className).toContain("border-l");
  });
});

// ─── ContextPanel Tab Bar — No Overflow ─────────────────────

describe("ContextPanel — tab bar overflow prevention", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = false;
    resetStores();
  });

  it("renders all 5 tabs in the tab bar", () => {
    render(<ContextPanel />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
  });

  it("tab bar has overflow-x-auto for horizontal scrolling on narrow panels", () => {
    render(<ContextPanel />);
    const tablist = screen.getByRole("tablist", {
      name: "Context panel tabs",
    });
    expect(tablist.className).toContain("overflow-x-auto");
  });

  it("tab bar has scrollbar-hide for clean appearance", () => {
    render(<ContextPanel />);
    const tablist = screen.getByRole("tablist", {
      name: "Context panel tabs",
    });
    expect(tablist.className).toContain("scrollbar-hide");
  });

  it("each tab has shrink-0 so tabs don't compress below readable width", () => {
    render(<ContextPanel />);
    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("shrink-0");
    });
  });

  it("each tab has min-w-[3.5rem] to maintain touch target size", () => {
    render(<ContextPanel />);
    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("min-w-[3.5rem]");
    });
  });

  it("tab bar is flex-shrink-0 so it doesn't collapse vertically", () => {
    render(<ContextPanel />);
    const tablist = screen.getByRole("tablist", {
      name: "Context panel tabs",
    });
    expect(tablist.className).toContain("shrink-0");
  });

  it("tabs have whitespace-nowrap to prevent text wrapping", () => {
    render(<ContextPanel />);
    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab.className).toContain("whitespace-nowrap");
    });
  });

  it("marks the active tab with aria-selected=true", () => {
    resetStores({ activeSidebarTab: "people" });
    render(<ContextPanel />);
    const activeTab = screen.getByRole("tab", { name: "People" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("marks inactive tabs with aria-selected=false", () => {
    resetStores({ activeSidebarTab: "people" });
    render(<ContextPanel />);
    const inactiveTab = screen.getByRole("tab", { name: "Art" });
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
  });
});

// ─── ContextPanel Mobile Bottom Sheet ───────────────────────

describe("ContextPanel — mobile bottom sheet alignment", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = true;
    resetStores();
  });

  it("shows a floating trigger button when closed on mobile", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);
    expect(screen.getByLabelText("Open context panel")).toBeInTheDocument();
  });

  it("floating button is fixed to bottom-right corner", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);
    const button = screen.getByLabelText("Open context panel");
    expect(button.className).toContain("fixed");
    expect(button.className).toContain("bottom-6");
    expect(button.className).toContain("right-4");
  });

  it("floating button has z-40 to appear above content", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);
    const button = screen.getByLabelText("Open context panel");
    expect(button.className).toContain("z-40");
  });

  it("floating button is hidden on desktop (lg:hidden)", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);
    const button = screen.getByLabelText("Open context panel");
    expect(button.className).toContain("lg:hidden");
  });

  it("mobile sheet constrains height to max-h-[70vh]", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    const inner = sheet.querySelector("[class*='max-h-']");
    expect(inner).toBeInTheDocument();
    expect(inner!.className).toContain("max-h-[70vh]");
  });

  it("mobile sheet is positioned at the bottom of the viewport", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    const inner = sheet.querySelector("[class*='bottom-0']");
    expect(inner).toBeInTheDocument();
    expect(inner!.className).toContain("left-0");
    expect(inner!.className).toContain("right-0");
  });

  it("mobile sheet has rounded top corners", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    const inner = sheet.querySelector("[class*='rounded-t-2xl']");
    expect(inner).toBeInTheDocument();
  });

  it("mobile sheet has safe-area bottom padding (pb-safe)", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    const inner = sheet.querySelector("[class*='pb-safe']");
    expect(inner).toBeInTheDocument();
  });

  it("has a drag handle element in the sheet", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    const handle = sheet.querySelector("[class*='rounded-full']");
    expect(handle).toBeInTheDocument();
  });

  it("renders close button inside mobile sheet", () => {
    render(<ContextPanel />);
    expect(screen.getByLabelText("Close context panel")).toBeInTheDocument();
  });

  it("backdrop covers entire viewport with fixed inset-0", () => {
    render(<ContextPanel />);
    const sheet = screen.getByRole("dialog");
    expect(sheet.className).toContain("fixed");
    expect(sheet.className).toContain("inset-0");
  });
});

// ─── ChapterNavigation Alignment ────────────────────────────

describe("ChapterNavigation — alignment and non-overlap", () => {
  it("uses flex with justify-between so prev/next don't overlap", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("flex");
    expect(nav.className).toContain("justify-between");
  });

  it("has items-center for vertical alignment of navigation", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("items-center");
  });

  it("has gap-2 to prevent prev/next from touching", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("gap-2");
  });

  it("constrains each link to max-w-[45%] to prevent overlap in the center", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const prevEl = screen.getByLabelText("Previous: Genesis 2");
    const nextEl = screen.getByLabelText("Next: Genesis 4");
    expect(prevEl.className).toContain("max-w-[45%]");
    expect(nextEl.className).toContain("max-w-[45%]");
  });

  it("prev/next links have overflow-hidden to prevent text bleedthrough", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const prevEl = screen.getByLabelText("Previous: Genesis 2");
    const nextEl = screen.getByLabelText("Next: Genesis 4");
    expect(prevEl.className).toContain("overflow-hidden");
    expect(nextEl.className).toContain("overflow-hidden");
  });

  it("book names truncate when too long", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const bookNameSpans = screen.getAllByText(/Genesis \d/);
    bookNameSpans.forEach((span) => {
      expect(span.className).toContain("truncate");
    });
  });

  it("has border-t to visually separate from content above", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("border-t");
  });

  it("uses touch-target class for mobile-friendly tap areas", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const prevEl = screen.getByLabelText("Previous: Genesis 2");
    const nextEl = screen.getByLabelText("Next: Genesis 4");
    expect(prevEl.className).toContain("touch-target");
    expect(nextEl.className).toContain("touch-target");
  });

  it("renders empty placeholder divs when only one direction exists", () => {
    const { container } = render(
      <ChapterNavigation prev={null} next={nextLink} />
    );
    const nav = container.querySelector("nav");
    // First child should be an empty div placeholder
    const firstChild = nav!.firstElementChild;
    expect(firstChild!.tagName).toBe("DIV");
    expect(firstChild!.children).toHaveLength(0);
  });
});

// ─── CrossRefPopover Viewport Clamping ──────────────────────

describe("CrossRefPopover — viewport boundary handling", () => {
  beforeEach(() => {
    useCrossRefStore.getState().hydrate({
      crossRefs: [makeRef(1), makeRef(2)],
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
  });

  it("popover card has max-w-[calc(100vw-1rem)] to stay within viewport", async () => {
    const user = userEvent.setup();
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-w-[calc(100vw-1rem)]");
  });

  it("popover has z-50 to appear above other content", async () => {
    const user = userEvent.setup();
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("z-50");
  });

  it("popover uses absolute positioning relative to trigger", async () => {
    const user = userEvent.setup();
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("absolute");
    expect(dialog.className).toContain("top-full");
  });

  it("popover has a fixed base width of w-72", async () => {
    const user = userEvent.setup();
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("w-72");
  });

  it("popover content area has max-h-60 with overflow-y-auto to prevent vertical overflow", async () => {
    const user = userEvent.setup();
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    const scrollArea = dialog.querySelector("[class*='max-h-60']");
    expect(scrollArea).toBeInTheDocument();
    expect(scrollArea!.className).toContain("overflow-y-auto");
  });

  it("trigger is wrapped in a relative inline span for popover positioning", () => {
    render(
      <CrossRefPopover verseNumber={5}>
        <sup>5</sup>
      </CrossRefPopover>
    );

    const trigger = screen.getByRole("button");
    const wrapper = trigger.closest("span.relative");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper!.className).toContain("inline");
  });
});

// ─── DictionaryTooltip Positioning ──────────────────────────

describe("DictionaryTooltip — positioning and viewport clamping", () => {
  beforeEach(() => {
    mockDesktopMatchMedia();
  });

  it("tooltip card has max-w-[calc(100vw-1rem)] to stay within viewport", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("max-w-[calc(100vw-1rem)]");
  });

  it("tooltip has z-50 to appear above all content", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("z-50");
  });

  it("tooltip is positioned above the trigger with bottom-full", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("bottom-full");
  });

  it("tooltip is centered horizontally with left-1/2", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("left-1/2");
  });

  it("tooltip has pointer-events-none so it doesn't intercept mouse", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("pointer-events-none");
  });

  it("tooltip has a fixed width of w-64 for consistent layout", () => {
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );
    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("w-64");
  });

  it("does not show tooltip on mobile (shows bottom sheet instead)", async () => {
    mockMobileMatchMedia();
    const user = userEvent.setup();
    render(
      <DictionaryTooltip entry={dictEntry}>thee</DictionaryTooltip>
    );

    const wrapper = screen.getByText("thee").closest("span.relative")!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // Tap shows bottom sheet instead
    await user.click(
      screen.getByRole("button", { name: "Dictionary word: Thee" })
    );
    expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
  });
});

// ─── Sidebar (Sidebar.tsx) Desktop Panel Alignment ──────────

describe("Sidebar — desktop panel width and non-overlap", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = false;
    resetStores();
  });

  it("uses responsive panel width: w-[320px] on lg, w-[380px] on xl", () => {
    render(<Sidebar />);
    const panel = screen.getByRole("complementary", {
      name: "Context panel",
    });
    expect(panel.className).toContain("w-[320px]");
    expect(panel.className).toContain("xl:w-[380px]");
  });

  it("panel container uses shrink-0 to prevent compression by main content", () => {
    render(<Sidebar />);
    // The outer wrapper div contains shrink-0
    const panel = screen.getByRole("complementary", { name: "Context panel" });
    const outer = panel.closest("[class*='shrink-0']");
    expect(outer).toBeInTheDocument();
  });

  it("panel is fixed right with right-0 for consistent edge alignment", () => {
    render(<Sidebar />);
    const panel = screen.getByRole("complementary", {
      name: "Context panel",
    });
    expect(panel.className).toContain("fixed");
    expect(panel.className).toContain("right-0");
  });

  it("panel starts below header at top-16", () => {
    render(<Sidebar />);
    const panel = screen.getByRole("complementary", {
      name: "Context panel",
    });
    expect(panel.className).toContain("top-16");
  });

  it("panel extends to viewport bottom with bottom-0", () => {
    render(<Sidebar />);
    const panel = screen.getByRole("complementary", {
      name: "Context panel",
    });
    expect(panel.className).toContain("bottom-0");
  });

  it("toggle button positioned to match panel edge", () => {
    render(<Sidebar />);
    const toggleBtn = screen.getByLabelText("Close context panel (F)");
    // When open, toggle is at the panel's left edge
    expect(toggleBtn.className).toContain("right-[320px]");
    expect(toggleBtn.className).toContain("xl:right-[380px]");
  });

  it("toggle button moves to right-0 when panel is closed", () => {
    resetStores({ sidebarOpen: false });
    render(<Sidebar />);
    const toggleBtn = screen.getByLabelText("Open context panel (F)");
    expect(toggleBtn.className).toContain("right-0");
  });

  it("outer container collapses to w-0 when closed to not consume space", () => {
    resetStores({ sidebarOpen: false });
    render(<Sidebar />);
    // The wrapper should have w-0 class (not the panel, which is hidden)
    const toggleBtn = screen.getByLabelText("Open context panel (F)");
    const wrapper = toggleBtn.closest("[class*='lg:flex']");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper!.className).toContain("w-0");
  });
});

// ─── Sidebar Mobile Sheet ───────────────────────────────────

describe("Sidebar — mobile sheet alignment", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = true;
    resetStores();
  });

  it("mobile sheet uses translate-y-full for closed state slide animation", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent.className).toContain(
      "data-[state=closed]:translate-y-full"
    );
  });

  it("mobile sheet is full-width (w-full max-w-full)", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent.className).toContain("w-full");
    expect(sheetContent.className).toContain("max-w-full");
  });

  it("mobile sheet constrains height to h-[70vh]", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent.className).toContain("h-[70vh]");
  });

  it("mobile sheet has rounded-t-2xl for bottom sheet appearance", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent.className).toContain("rounded-t-2xl");
  });

  it("mobile sheet prevents horizontal translation (translate-x-0)", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent.className).toContain(
      "data-[state=open]:translate-x-0"
    );
    expect(sheetContent.className).toContain(
      "data-[state=closed]:translate-x-0"
    );
  });
});

// ─── Cross-Component Integration: Panel + Content ───────────

describe("Bible reader layout — panel and content coordination", () => {
  beforeEach(() => {
    mockIsMobileContextPanel = false;
    resetStores();
  });

  it("ContextPanel toggle button toggles sidebarOpen state", async () => {
    const user = userEvent.setup();
    render(<ContextPanel />);

    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
    const toggleBtn = screen.getByLabelText("Collapse panel");
    await user.click(toggleBtn);
    expect(usePreferencesStore.getState().sidebarOpen).toBe(false);
  });

  it("tab changes update the activeSidebarTab store state", async () => {
    const user = userEvent.setup();
    render(<ContextPanel />);

    const peopleTab = screen.getByRole("tab", { name: "People" });
    await user.click(peopleTab);

    expect(usePreferencesStore.getState().activeSidebarTab).toBe("people");
  });

  it("ContextPanel content area has overflow-y-auto to prevent vertical overflow", () => {
    render(<ContextPanel />);
    const aside = screen.getByLabelText("Context panel");
    const scrollArea = aside.querySelector("[class*='overflow-y-auto']");
    expect(scrollArea).toBeInTheDocument();
  });

  it("collapsed rail renders tab icons as expand buttons", () => {
    resetStores({ sidebarOpen: false });
    render(<ContextPanel />);

    // Rail should show icon buttons for each tab
    const tabButtons = screen
      .getByLabelText("Context panel")
      .querySelectorAll("button[aria-label]");
    // Should have toggle button + 5 tab icons
    expect(tabButtons.length).toBeGreaterThanOrEqual(5);
  });

  it("clicking a collapsed rail icon opens the panel and sets the tab", async () => {
    resetStores({ sidebarOpen: false });
    const user = userEvent.setup();
    render(<ContextPanel />);

    const peopleIcon = screen.getByLabelText("People");
    await user.click(peopleIcon);

    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("people");
  });
});
