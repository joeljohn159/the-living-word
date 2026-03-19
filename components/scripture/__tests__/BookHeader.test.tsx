import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookHeader } from "../BookHeader";

describe("BookHeader", () => {
  const defaultProps = {
    name: "Genesis",
    category: "Law",
    testament: "OT" as const,
    author: "Moses",
    dateWritten: "c. 1445–1405 BC",
    keyThemes: "Creation, Fall, Covenant, Faith, Providence",
    description: "The book of beginnings.",
  };

  it("renders the book name as a heading", () => {
    render(<BookHeader {...defaultProps} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Genesis");
  });

  it("renders category badge with display category", () => {
    render(<BookHeader {...defaultProps} />);
    expect(screen.getByText("Law")).toBeInTheDocument();
  });

  it("maps compound category to display category (Major Prophets -> Prophets)", () => {
    render(<BookHeader {...defaultProps} category="Major Prophets" name="Isaiah" />);
    expect(screen.getByText("Prophets")).toBeInTheDocument();
  });

  it("maps Pauline Epistles to Epistles display category", () => {
    render(<BookHeader {...defaultProps} category="Pauline Epistles" name="Romans" />);
    expect(screen.getByText("Epistles")).toBeInTheDocument();
  });

  it("displays Old Testament label for OT books", () => {
    render(<BookHeader {...defaultProps} testament="OT" />);
    expect(screen.getByText("Old Testament")).toBeInTheDocument();
  });

  it("displays New Testament label for NT books", () => {
    render(<BookHeader {...defaultProps} testament="NT" />);
    expect(screen.getByText("New Testament")).toBeInTheDocument();
  });

  it("renders author when provided", () => {
    render(<BookHeader {...defaultProps} />);
    expect(screen.getByText("Author")).toBeInTheDocument();
    expect(screen.getByText("Moses")).toBeInTheDocument();
  });

  it("renders date written when provided", () => {
    render(<BookHeader {...defaultProps} />);
    expect(screen.getByText("Date Written")).toBeInTheDocument();
    expect(screen.getByText("c. 1445–1405 BC")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<BookHeader {...defaultProps} />);
    expect(screen.getByText("The book of beginnings.")).toBeInTheDocument();
  });

  it("renders key themes as individual badges", () => {
    render(<BookHeader {...defaultProps} />);
    expect(screen.getByText("Creation")).toBeInTheDocument();
    expect(screen.getByText("Fall")).toBeInTheDocument();
    expect(screen.getByText("Covenant")).toBeInTheDocument();
    expect(screen.getByText("Faith")).toBeInTheDocument();
    expect(screen.getByText("Providence")).toBeInTheDocument();
  });

  it("does not render author section when author is null", () => {
    render(<BookHeader {...defaultProps} author={null} />);
    expect(screen.queryByText("Author")).not.toBeInTheDocument();
  });

  it("does not render date section when dateWritten is null", () => {
    render(<BookHeader {...defaultProps} dateWritten={null} />);
    expect(screen.queryByText("Date Written")).not.toBeInTheDocument();
  });

  it("does not render description when null", () => {
    render(<BookHeader {...defaultProps} description={null} />);
    expect(screen.queryByText("The book of beginnings.")).not.toBeInTheDocument();
  });

  it("does not render key themes section when keyThemes is null", () => {
    render(<BookHeader {...defaultProps} keyThemes={null} />);
    expect(screen.queryByText("Key Themes")).not.toBeInTheDocument();
  });

  it("does not render key themes section when keyThemes is empty string", () => {
    render(<BookHeader {...defaultProps} keyThemes="" />);
    expect(screen.queryByText("Key Themes")).not.toBeInTheDocument();
  });

  it("renders correctly with all optional fields null (minimal book)", () => {
    render(
      <BookHeader
        name="Obadiah"
        category="Minor Prophets"
        testament="OT"
        author={null}
        dateWritten={null}
        keyThemes={null}
        description={null}
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Obadiah");
    expect(screen.getByText("Prophets")).toBeInTheDocument();
    expect(screen.getByText("Old Testament")).toBeInTheDocument();
  });

  it("trims whitespace from theme names", () => {
    render(<BookHeader {...defaultProps} keyThemes="  Love ,  Grace  , Hope  " />);
    expect(screen.getByText("Love")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Hope")).toBeInTheDocument();
  });
});
