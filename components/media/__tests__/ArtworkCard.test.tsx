import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtworkCard } from "../ArtworkCard";
import type { MediaItem } from "../types";

// Stub next/image to a plain <img>
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

function makeItem(overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    id: 1,
    title: "The Creation of Adam",
    description: "A famous fresco painting",
    artist: "Michelangelo",
    yearCreated: "1512",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Creation_of_Adam.jpg",
    imageUrl: "https://upload.wikimedia.org/creation.jpg",
    attribution: "Wikimedia Commons",
    license: "Public Domain",
    mediaType: "painting",
    ...overrides,
  };
}

describe("ArtworkCard", () => {
  it("renders the artwork title", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    expect(screen.getByText("The Creation of Adam")).toBeInTheDocument();
  });

  it("renders the artist name when provided", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    expect(screen.getByText("Michelangelo")).toBeInTheDocument();
  });

  it("renders the year when provided", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    expect(screen.getByText("1512")).toBeInTheDocument();
  });

  it("does not render artist when null", () => {
    render(
      <ArtworkCard item={makeItem({ artist: null })} onSelect={vi.fn()} />,
    );
    expect(screen.queryByText("Michelangelo")).not.toBeInTheDocument();
  });

  it("does not render year when null", () => {
    render(
      <ArtworkCard
        item={makeItem({ yearCreated: null })}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("1512")).not.toBeInTheDocument();
  });

  it("renders lazy-loaded image when imageUrl is present", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://upload.wikimedia.org/creation.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("alt", "The Creation of Adam");
  });

  it("renders a placeholder icon when imageUrl is null", () => {
    render(
      <ArtworkCard item={makeItem({ imageUrl: null })} onSelect={vi.fn()} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows Wikimedia link indicator when sourceUrl is present", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    expect(screen.getByText("Wikimedia")).toBeInTheDocument();
  });

  it("does not show Wikimedia indicator when sourceUrl is null", () => {
    render(
      <ArtworkCard
        item={makeItem({ sourceUrl: null })}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("Wikimedia")).not.toBeInTheDocument();
  });

  it("calls onSelect with the item when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const item = makeItem();

    render(<ArtworkCard item={item} onSelect={onSelect} />);
    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(item);
  });

  it("has an accessible aria-label including title and artist", () => {
    render(<ArtworkCard item={makeItem()} onSelect={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "View The Creation of Adam by Michelangelo",
    );
  });

  it("has an accessible aria-label without artist when null", () => {
    render(
      <ArtworkCard item={makeItem({ artist: null })} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "View The Creation of Adam",
    );
  });

  it("renders with minimal data (only required fields)", () => {
    const minimal = makeItem({
      artist: null,
      yearCreated: null,
      sourceUrl: null,
      imageUrl: null,
      attribution: null,
      license: null,
      description: null,
    });

    render(<ArtworkCard item={minimal} onSelect={vi.fn()} />);
    expect(screen.getByText("The Creation of Adam")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
