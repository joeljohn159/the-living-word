import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookGrid } from "../BookGrid";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, layout, initial, animate, exit, transition, ...rest }: React.PropsWithChildren<Record<string, unknown>>) => {
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("BookGrid", () => {
  it("renders all 66 books by default", () => {
    render(<BookGrid />);
    expect(screen.getByText("66")).toBeInTheDocument();
    expect(screen.getByText(/books/)).toBeInTheDocument();
  });

  it("renders testament filter and category filter controls", () => {
    render(<BookGrid />);
    expect(
      screen.getByRole("radiogroup", { name: /filter by testament/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: /filter by category/i })
    ).toBeInTheDocument();
  });

  it("filters to only Old Testament books when OT is selected", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    await user.click(screen.getByText("Old Testament"));

    // OT has 39 books
    expect(screen.getByText("39")).toBeInTheDocument();
    // Should show Genesis (OT) but not Matthew (NT)
    expect(screen.getByText("Genesis")).toBeInTheDocument();
    expect(screen.queryByText("Matthew")).not.toBeInTheDocument();
  });

  it("filters to only New Testament books when NT is selected", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    await user.click(screen.getByText("New Testament"));

    // NT has 27 books
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("Matthew")).toBeInTheDocument();
    expect(screen.queryByText("Genesis")).not.toBeInTheDocument();
  });

  it("filters by category when a category chip is clicked", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    const categoryGroup = screen.getByRole("radiogroup", { name: /filter by category/i });
    await user.click(within(categoryGroup).getByText("Law"));

    // Law books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy = 5
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Genesis")).toBeInTheDocument();
    expect(screen.getByText("Exodus")).toBeInTheDocument();
    expect(screen.queryByText("Psalms")).not.toBeInTheDocument();
  });

  it("combines testament and category filters", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    const categoryGroup = screen.getByRole("radiogroup", { name: /filter by category/i });

    // Select NT + Epistles → should show only NT epistles
    await user.click(screen.getByText("New Testament"));
    await user.click(within(categoryGroup).getByText("Epistles"));

    // Should show Romans but not Genesis
    expect(screen.getByText("Romans")).toBeInTheDocument();
    expect(screen.queryByText("Genesis")).not.toBeInTheDocument();
    expect(screen.queryByText("Matthew")).not.toBeInTheDocument();
  });

  it("shows empty state when no books match filters", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    const categoryGroup = screen.getByRole("radiogroup", { name: /filter by category/i });

    // Select OT + Gospels → no books match
    await user.click(screen.getByText("Old Testament"));
    await user.click(within(categoryGroup).getByText("Gospels"));

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/No books match your filters/)).toBeInTheDocument();
  });

  it("clear filters button resets both filters", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    const categoryGroup = screen.getByRole("radiogroup", { name: /filter by category/i });

    // Apply filters that result in zero matches
    await user.click(screen.getByText("Old Testament"));
    await user.click(within(categoryGroup).getByText("Gospels"));

    expect(screen.getByText(/No books match/)).toBeInTheDocument();

    // Click "Clear filters"
    await user.click(screen.getByText("Clear filters"));

    // Should be back to 66
    expect(screen.getByText("66")).toBeInTheDocument();
  });

  it("shows singular 'book' when only 1 book matches", async () => {
    const user = userEvent.setup();
    render(<BookGrid />);

    const categoryGroup = screen.getByRole("radiogroup", { name: /filter by category/i });
    await user.click(within(categoryGroup).getByText("Apocalyptic"));

    // Only Revelation is Apocalyptic
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/\bbook\b/)).toBeInTheDocument();
  });

  it("each book card links to its slug URL", () => {
    render(<BookGrid />);
    const genesisLink = screen.getByRole("link", { name: /Genesis/ });
    expect(genesisLink).toHaveAttribute("href", "/bible/genesis");
  });
});
