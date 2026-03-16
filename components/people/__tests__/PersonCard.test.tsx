import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonCard } from "../PersonCard";

const defaultProps = {
  name: "Moses",
  slug: "moses",
  description: "Led the Israelites out of Egypt.",
  tribeOrGroup: "Levite",
  alsoKnownAs: "Moshe",
};

describe("PersonCard", () => {
  it("renders the person name", () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText("Moses")).toBeInTheDocument();
  });

  it("links to the correct profile page", () => {
    render(<PersonCard {...defaultProps} />);
    const link = screen.getByRole("link", { name: /View profile of Moses/i });
    expect(link).toHaveAttribute("href", "/people/moses");
  });

  it("shows alternate names when provided", () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText(/Also known as: Moshe/)).toBeInTheDocument();
  });

  it("hides alternate names when null", () => {
    render(<PersonCard {...defaultProps} alsoKnownAs={null} />);
    expect(screen.queryByText(/Also known as/)).not.toBeInTheDocument();
  });

  it("shows tribe/group badge when provided", () => {
    render(<PersonCard {...defaultProps} />);
    expect(screen.getByText("Levite")).toBeInTheDocument();
  });

  it("hides tribe/group badge when null", () => {
    render(<PersonCard {...defaultProps} tribeOrGroup={null} />);
    expect(screen.queryByText("Levite")).not.toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(<PersonCard {...defaultProps} />);
    expect(
      screen.getByText("Led the Israelites out of Egypt.")
    ).toBeInTheDocument();
  });

  it("hides description when null", () => {
    render(<PersonCard {...defaultProps} description={null} />);
    expect(
      screen.queryByText("Led the Israelites out of Egypt.")
    ).not.toBeInTheDocument();
  });

  it("renders with all optional fields null (minimal card)", () => {
    render(
      <PersonCard
        name="Unknown Person"
        slug="unknown"
        description={null}
        tribeOrGroup={null}
        alsoKnownAs={null}
      />
    );
    expect(screen.getByText("Unknown Person")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View profile of Unknown Person/i })
    ).toHaveAttribute("href", "/people/unknown");
  });
});
