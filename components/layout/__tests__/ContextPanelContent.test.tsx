import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContextPanelContent } from "../ContextPanelContent";

// Stub framer-motion
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className }: Record<string, unknown>) => (
      <div className={className as string}>{children as React.ReactNode}</div>
    ),
  },
}));

// Stub tab content components
vi.mock("@/components/layout/EvidenceTabContent", () => ({
  EvidenceTabContent: () => <div data-testid="evidence-tab">Evidence content</div>,
}));

vi.mock("@/components/people/PeopleTabContent", () => ({
  PeopleTabContent: () => <div data-testid="people-tab">People content</div>,
}));

vi.mock("@/components/notes/NotesTabContent", () => ({
  NotesTabContent: ({ book, chapter }: { book: string; chapter: number }) => (
    <div data-testid="notes-tab">
      Notes for {book} {chapter}
    </div>
  ),
}));

vi.mock("@/components/maps/MapTabContent", () => ({
  MapTabContent: () => <div data-testid="map-tab">Map content</div>,
}));

describe("ContextPanelContent", () => {
  it("renders evidence tab content when activeTab is 'evidence'", () => {
    render(<ContextPanelContent activeTab="evidence" />);
    expect(screen.getByTestId("evidence-tab")).toBeInTheDocument();
  });

  it("renders people tab content when activeTab is 'people'", () => {
    render(<ContextPanelContent activeTab="people" />);
    expect(screen.getByTestId("people-tab")).toBeInTheDocument();
  });

  it("renders notes tab content when activeTab is 'notes'", () => {
    render(<ContextPanelContent activeTab="notes" book="Exodus" chapter={3} />);
    expect(screen.getByTestId("notes-tab")).toHaveTextContent("Notes for Exodus 3");
  });

  it("renders notes tab with default book/chapter when not provided", () => {
    render(<ContextPanelContent activeTab="notes" />);
    expect(screen.getByTestId("notes-tab")).toHaveTextContent("Notes for Genesis 1");
  });

  it("renders map tab content when activeTab is 'map'", () => {
    render(<ContextPanelContent activeTab="map" />);
    expect(screen.getByTestId("map-tab")).toBeInTheDocument();
  });

  it("renders a placeholder for the 'visuals' tab", () => {
    render(<ContextPanelContent activeTab="visuals" />);
    expect(screen.getByText("Visuals")).toBeInTheDocument();
    expect(
      screen.getByText("Artwork and illustrations for this passage")
    ).toBeInTheDocument();
  });

  it("renders a placeholder for the 'cross-references' tab", () => {
    render(<ContextPanelContent activeTab="cross-references" />);
    expect(screen.getByText("Cross-Refs")).toBeInTheDocument();
    expect(
      screen.getByText("Related verses and passages")
    ).toBeInTheDocument();
  });

  it("returns null for an unknown tab key", () => {
    const { container } = render(
      <ContextPanelContent activeTab="nonexistent" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("uses overflow-hidden layout for the map tab", () => {
    const { container } = render(<ContextPanelContent activeTab="map" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("overflow-hidden");
  });

  it("uses overflow-y-auto layout for non-map tabs", () => {
    const { container } = render(<ContextPanelContent activeTab="evidence" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("overflow-y-auto");
  });
});
