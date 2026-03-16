import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaGallery } from "../MediaGallery";
import type { MediaItem } from "../types";

// Stub next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...(Object.fromEntries(
        Object.entries(props).filter(
          ([k]) => !["fill", "sizes", "unoptimized", "priority"].includes(k),
        ),
      ) as Record<string, unknown>)}
    />
  ),
}));

// Stub Radix Dialog to render inline for testing
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="dialog-root">{children}</div> : null),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: ({ className }: { className: string }) => (
    <div data-testid="dialog-overlay" className={className} />
  ),
  Content: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
    "aria-describedby"?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  Title: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  Close: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeItem(id: number, overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    id,
    title: `Painting ${id}`,
    description: `Description for painting ${id}`,
    artist: `Artist ${id}`,
    yearCreated: `${1500 + id}`,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:painting_${id}.jpg`,
    imageUrl: `https://upload.wikimedia.org/painting_${id}.jpg`,
    attribution: "Wikimedia Commons",
    license: "Public Domain",
    mediaType: "painting",
    ...overrides,
  };
}

describe("MediaGallery", () => {
  describe("empty state", () => {
    it("shows empty state when items array is empty", () => {
      render(<MediaGallery items={[]} />);
      expect(screen.getByText("No Artwork Available")).toBeInTheDocument();
    });

    it("shows a helpful description in empty state", () => {
      render(<MediaGallery items={[]} />);
      expect(
        screen.getByText(
          "There are no paintings or illustrations linked to this chapter yet.",
        ),
      ).toBeInTheDocument();
    });

    it("does not render the grid in empty state", () => {
      const { container } = render(<MediaGallery items={[]} />);
      expect(container.querySelector(".grid")).not.toBeInTheDocument();
    });
  });

  describe("with items", () => {
    it("renders all artwork cards", () => {
      const items = [makeItem(1), makeItem(2), makeItem(3)];
      render(<MediaGallery items={items} />);

      expect(screen.getByText("Painting 1")).toBeInTheDocument();
      expect(screen.getByText("Painting 2")).toBeInTheDocument();
      expect(screen.getByText("Painting 3")).toBeInTheDocument();
    });

    it("does not show empty state when items exist", () => {
      render(<MediaGallery items={[makeItem(1)]} />);
      expect(
        screen.queryByText("No Artwork Available"),
      ).not.toBeInTheDocument();
    });

    it("renders a single item correctly", () => {
      render(<MediaGallery items={[makeItem(1)]} />);
      expect(screen.getByText("Painting 1")).toBeInTheDocument();
      expect(screen.getByText("Artist 1")).toBeInTheDocument();
    });
  });

  describe("expanded view interaction", () => {
    it("opens expanded view when a card is clicked", async () => {
      const user = userEvent.setup();
      render(<MediaGallery items={[makeItem(1)]} />);

      // Dialog should not be open initially
      expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button"));

      // Dialog should open with the artwork title
      const dialog = screen.getByTestId("dialog-root");
      expect(dialog).toBeInTheDocument();
      // The expanded view shows the title in a heading
      expect(within(dialog).getByText("Painting 1")).toBeInTheDocument();
    });

    it("selects the correct item from multiple cards", async () => {
      const user = userEvent.setup();
      const items = [makeItem(1), makeItem(2)];
      render(<MediaGallery items={items} />);

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]); // Click second card

      const dialog = screen.getByTestId("dialog-root");
      expect(within(dialog).getByText("Painting 2")).toBeInTheDocument();
    });
  });

  describe("many items", () => {
    it("handles a large number of items", () => {
      const items = Array.from({ length: 20 }, (_, i) => makeItem(i + 1));
      render(<MediaGallery items={items} />);

      expect(screen.getByText("Painting 1")).toBeInTheDocument();
      expect(screen.getByText("Painting 20")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(20);
    });
  });
});
