import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PeopleTabCard, type ChapterPerson } from "../PeopleTabCard";

const makePerson = (overrides: Partial<ChapterPerson> = {}): ChapterPerson => ({
  id: 1,
  name: "Abraham",
  slug: "abraham",
  description: "The father of many nations, called by God to leave Ur.",
  alsoKnownAs: "Abram",
  tribeOrGroup: "Hebrew",
  fatherName: "Terah",
  motherName: null,
  spouseName: "Sarah",
  ...overrides,
});

describe("PeopleTabCard", () => {
  it("renders the person name", () => {
    render(<PeopleTabCard person={makePerson()} />);
    expect(screen.getByText("Abraham")).toBeInTheDocument();
  });

  it("links to the person profile page", () => {
    render(<PeopleTabCard person={makePerson()} />);
    const link = screen.getByRole("link", { name: /View profile of Abraham/i });
    expect(link).toHaveAttribute("href", "/people/abraham");
  });

  it("shows the tribe/group badge when present", () => {
    render(<PeopleTabCard person={makePerson({ tribeOrGroup: "Levite" })} />);
    expect(screen.getByText("Levite")).toBeInTheDocument();
  });

  it("hides the tribe/group badge when null", () => {
    render(<PeopleTabCard person={makePerson({ tribeOrGroup: null })} />);
    expect(screen.queryByText("Hebrew")).not.toBeInTheDocument();
  });

  it("renders the description snippet when present", () => {
    render(<PeopleTabCard person={makePerson()} />);
    expect(
      screen.getByText(/The father of many nations/)
    ).toBeInTheDocument();
  });

  it("hides the description when null", () => {
    render(<PeopleTabCard person={makePerson({ description: null })} />);
    // No paragraph with description text should exist
    expect(
      screen.queryByText(/The father of many nations/)
    ).not.toBeInTheDocument();
  });

  it("shows father family connection", () => {
    render(<PeopleTabCard person={makePerson()} />);
    expect(screen.getByText("Father:")).toBeInTheDocument();
    expect(screen.getByText("Terah")).toBeInTheDocument();
  });

  it("shows spouse family connection", () => {
    render(<PeopleTabCard person={makePerson()} />);
    expect(screen.getByText("Spouse:")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
  });

  it("hides family section when no family connections exist", () => {
    render(
      <PeopleTabCard
        person={makePerson({
          fatherName: null,
          motherName: null,
          spouseName: null,
        })}
      />
    );
    expect(screen.queryByText("Father:")).not.toBeInTheDocument();
    expect(screen.queryByText("Mother:")).not.toBeInTheDocument();
    expect(screen.queryByText("Spouse:")).not.toBeInTheDocument();
  });

  it("shows all three family connections when all are present", () => {
    render(
      <PeopleTabCard
        person={makePerson({
          fatherName: "Terah",
          motherName: "Amathlaah",
          spouseName: "Sarah",
        })}
      />
    );
    expect(screen.getByText("Father:")).toBeInTheDocument();
    expect(screen.getByText("Mother:")).toBeInTheDocument();
    expect(screen.getByText("Spouse:")).toBeInTheDocument();
  });

  it("has an accessible aria-label on the link", () => {
    render(<PeopleTabCard person={makePerson({ name: "Moses" })} />);
    expect(
      screen.getByLabelText("View profile of Moses")
    ).toBeInTheDocument();
  });
});
