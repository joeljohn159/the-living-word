import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Footer } from "../Footer";

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

describe("Footer", () => {
  it("renders without errors", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays the site name 'The Living Word'", () => {
    render(<Footer />);
    expect(screen.getByText("The Living Word")).toBeInTheDocument();
  });

  it("displays the about description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Experience the King James Bible/i)
    ).toBeInTheDocument();
  });

  it("renders footer navigation with correct aria-label", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer navigation" });
    expect(nav).toBeInTheDocument();
  });

  it("renders all expected nav links in the footer", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer navigation" });
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

  it("renders nav links with correct hrefs", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer navigation" });
    const bibleLink = within(nav).getByText("Bible").closest("a");
    expect(bibleLink).toHaveAttribute("href", "/bible");

    const mapsLink = within(nav).getByText("Maps").closest("a");
    expect(mapsLink).toHaveAttribute("href", "/maps");
  });

  it("renders the translation selector with KJV as default", () => {
    render(<Footer />);
    const select = screen.getByLabelText("Select Bible translation");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("KJV");
  });

  it("displays 'More translations coming soon' note", () => {
    render(<Footer />);
    expect(
      screen.getByText("More translations coming soon")
    ).toBeInTheDocument();
  });

  it("renders About and Privacy links", () => {
    render(<Footer />);
    const aboutLink = screen.getByRole("link", { name: "About" });
    const privacyLink = screen.getByRole("link", { name: "Privacy" });
    expect(aboutLink).toHaveAttribute("href", "/about");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("displays copyright text with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${year} The Living Word`))
    ).toBeInTheDocument();
  });

  it("mentions that scripture text is in the public domain", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Scripture text is in the public domain/i)
    ).toBeInTheDocument();
  });

  it("renders the Explore section heading", () => {
    render(<Footer />);
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });

  it("renders the Translation label", () => {
    render(<Footer />);
    expect(screen.getByText("Translation")).toBeInTheDocument();
  });

  it("has the version select option with full name", () => {
    render(<Footer />);
    const option = screen.getByRole("option", {
      name: "KJV — King James Version",
    });
    expect(option).toBeInTheDocument();
    expect(option).toHaveValue("KJV");
  });

  it("renders the nav list with role='list'", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer navigation" });
    expect(within(nav).getByRole("list")).toBeInTheDocument();
  });
});
