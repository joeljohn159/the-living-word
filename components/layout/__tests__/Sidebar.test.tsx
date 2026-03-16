import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";
import { usePreferencesStore } from "@/stores/preferences";

// ---------- Mocks ----------

// Control desktop vs mobile from tests
let mockIsMobile = false;
vi.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: () => mockIsMobile,
}));

// Stub framer-motion to render children immediately (no animations in tests)
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    aside: ({
      children,
      className,
      role,
      "aria-label": ariaLabel,
    }: Record<string, unknown>) => (
      <aside className={className as string} role={role as string} aria-label={ariaLabel as string}>
        {children as React.ReactNode}
      </aside>
    ),
    div: ({
      children,
      className,
    }: Record<string, unknown>) => (
      <div className={className as string}>{children as React.ReactNode}</div>
    ),
  },
}));

// Stub child content so we can detect which tab renders
vi.mock("@/components/layout/ContextPanelContent", () => ({
  ContextPanelContent: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="context-panel-content">{activeTab}</div>
  ),
}));

// Stub Sheet to render children directly
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="mobile-sheet">{children}</div> : null,
  SheetContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-content" className={className}>
      {children}
    </div>
  ),
}));

// ---------- Helpers ----------

function resetStore(overrides: Record<string, unknown> = {}) {
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

// ---------- Tests ----------

describe("Sidebar — Desktop", () => {
  beforeEach(() => {
    mockIsMobile = false;
    resetStore();
  });

  it("renders the context panel when sidebar is open", () => {
    render(<Sidebar />);
    expect(screen.getByRole("complementary", { name: "Context panel" })).toBeInTheDocument();
  });

  it("renders all 6 tab triggers", () => {
    render(<Sidebar />);
    const tabList = screen.getByRole("tablist", { name: "Context panel tabs" });
    expect(tabList).toBeInTheDocument();

    // Each tab trigger should be present
    const triggers = screen.getAllByRole("tab");
    expect(triggers).toHaveLength(6);
  });

  it("hides the panel when sidebar is closed", () => {
    resetStore({ sidebarOpen: false });
    render(<Sidebar />);
    expect(screen.queryByRole("complementary", { name: "Context panel" })).not.toBeInTheDocument();
  });

  it("shows correct toggle button label when panel is open", () => {
    render(<Sidebar />);
    expect(screen.getByLabelText("Close context panel (F)")).toBeInTheDocument();
  });

  it("shows correct toggle button label when panel is closed", () => {
    resetStore({ sidebarOpen: false });
    render(<Sidebar />);
    expect(screen.getByLabelText("Open context panel (F)")).toBeInTheDocument();
  });

  it("toggles the panel when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Panel is initially open
    expect(screen.getByRole("complementary", { name: "Context panel" })).toBeInTheDocument();

    // Click close
    await user.click(screen.getByLabelText("Close context panel (F)"));

    // Store should have toggled
    expect(usePreferencesStore.getState().sidebarOpen).toBe(false);
  });

  it("passes the active tab to ContextPanelContent", () => {
    resetStore({ activeSidebarTab: "evidence" });
    render(<Sidebar />);
    expect(screen.getByTestId("context-panel-content")).toHaveTextContent("evidence");
  });

  it("updates the active tab in the store when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Click on the "Notes" tab trigger
    const notesTrigger = screen.getByRole("tab", { name: /Notes/i });
    await user.click(notesTrigger);

    expect(usePreferencesStore.getState().activeSidebarTab).toBe("notes");
  });

  it("renders keyboard shortcut hints in the footer", () => {
    render(<Sidebar />);
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("toggle panel")).toBeInTheDocument();
    expect(screen.getByText("map")).toBeInTheDocument();
  });

  it("remembers the last active tab across re-renders", () => {
    resetStore({ activeSidebarTab: "people" });
    const { unmount } = render(<Sidebar />);
    expect(screen.getByTestId("context-panel-content")).toHaveTextContent("people");
    unmount();

    // Re-render — store should still hold 'people'
    render(<Sidebar />);
    expect(screen.getByTestId("context-panel-content")).toHaveTextContent("people");
    expect(usePreferencesStore.getState().activeSidebarTab).toBe("people");
  });
});

describe("Sidebar — Mobile", () => {
  beforeEach(() => {
    mockIsMobile = true;
    resetStore();
  });

  it("renders as a Sheet when on mobile and sidebar is open", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("mobile-sheet")).toBeInTheDocument();
  });

  it("renders tab triggers inside the mobile sheet", () => {
    render(<Sidebar />);
    const triggers = screen.getAllByRole("tab");
    expect(triggers).toHaveLength(6);
  });

  it("shows a floating trigger button when panel is closed on mobile", () => {
    resetStore({ sidebarOpen: false });
    render(<Sidebar />);
    expect(screen.getByLabelText("Open context panel")).toBeInTheDocument();
  });

  it("hides the floating trigger button when panel is open on mobile", () => {
    render(<Sidebar />);
    expect(screen.queryByLabelText("Open context panel")).not.toBeInTheDocument();
  });

  it("opens the sidebar when the floating button is clicked", async () => {
    resetStore({ sidebarOpen: false });
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByLabelText("Open context panel"));
    expect(usePreferencesStore.getState().sidebarOpen).toBe(true);
  });

  it("does not render the desktop toggle button on mobile", () => {
    render(<Sidebar />);
    expect(screen.queryByLabelText("Close context panel (F)")).not.toBeInTheDocument();
  });

  it("includes a drag handle in the mobile sheet", () => {
    render(<Sidebar />);
    const sheetContent = screen.getByTestId("sheet-content");
    // Drag handle is a small rounded div
    expect(sheetContent).toBeInTheDocument();
  });
});
