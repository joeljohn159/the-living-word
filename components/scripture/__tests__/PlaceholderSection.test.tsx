import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaceholderSection } from "../PlaceholderSection";

describe("PlaceholderSection", () => {
  const defaultProps = {
    title: "Archaeological Evidence",
    description: "Discoveries and artifacts related to this book will appear here.",
    icon: <span data-testid="test-icon">icon</span>,
  };

  it("renders the title as a heading", () => {
    render(<PlaceholderSection {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: 3 })
    ).toHaveTextContent("Archaeological Evidence");
  });

  it("renders the description text", () => {
    render(<PlaceholderSection {...defaultProps} />);
    expect(
      screen.getByText("Discoveries and artifacts related to this book will appear here.")
    ).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(<PlaceholderSection {...defaultProps} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies additional className when provided", () => {
    const { container } = render(
      <PlaceholderSection {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with different content", () => {
    render(
      <PlaceholderSection
        title="Key People"
        description="Important figures mentioned in this book will appear here."
        icon={<span data-testid="people-icon">people</span>}
      />
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Key People");
    expect(
      screen.getByText("Important figures mentioned in this book will appear here.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("people-icon")).toBeInTheDocument();
  });
});
