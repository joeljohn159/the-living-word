import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelationshipBadge } from "../RelationshipBadge";

describe("RelationshipBadge", () => {
  const KNOWN_RELATIONSHIPS = [
    { type: "parallel", label: "Parallel" },
    { type: "prophecy-fulfillment", label: "Prophecy" },
    { type: "quotation", label: "Quotation" },
    { type: "allusion", label: "Allusion" },
    { type: "contrast", label: "Contrast" },
  ];

  it.each(KNOWN_RELATIONSHIPS)(
    "renders the correct label for $type",
    ({ type, label }) => {
      render(<RelationshipBadge relationship={type} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );

  it("renders nothing for an unknown relationship type", () => {
    const { container } = render(
      <RelationshipBadge relationship="unknown-type" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for an empty string relationship", () => {
    const { container } = render(<RelationshipBadge relationship="" />);
    expect(container.innerHTML).toBe("");
  });

  it("applies color classes specific to the relationship type", () => {
    const { container: blue } = render(
      <RelationshipBadge relationship="parallel" />,
    );
    expect(blue.querySelector("span")).toHaveClass("text-blue-400");

    const { container: amber } = render(
      <RelationshipBadge relationship="prophecy-fulfillment" />,
    );
    expect(amber.querySelector("span")).toHaveClass("text-amber-400");
  });
});
