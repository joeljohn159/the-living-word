import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PeopleTabEmpty } from "../PeopleTabEmpty";

describe("PeopleTabEmpty", () => {
  it("renders the empty state heading and message", () => {
    render(<PeopleTabEmpty />);

    expect(screen.getByText("No People Found")).toBeInTheDocument();
    expect(
      screen.getByText("No named individuals are referenced in this chapter.")
    ).toBeInTheDocument();
  });

  it("has an accessible status role with label", () => {
    render(<PeopleTabEmpty />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "No people found");
  });
});
