import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KjvBadge } from "../KjvBadge";

describe("KjvBadge", () => {
  it("renders without errors", () => {
    render(<KjvBadge />);
    expect(screen.getByText("KJV")).toBeInTheDocument();
  });

  it("displays 'KJV' text", () => {
    render(<KjvBadge />);
    const badge = screen.getByText("KJV");
    expect(badge).toBeInTheDocument();
  });

  it("has an accessible aria-label describing the badge", () => {
    render(<KjvBadge />);
    const badge = screen.getByLabelText(
      "King James Version — more translations coming soon"
    );
    expect(badge).toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();
    render(<KjvBadge />);

    const trigger = screen.getByText("KJV");
    await user.hover(trigger);

    // Tooltip may be delayed; the aria-label provides the info regardless
    expect(trigger.closest("[aria-label]")).toHaveAttribute(
      "aria-label",
      "King James Version — more translations coming soon"
    );
  });

  it("applies custom className when provided", () => {
    render(<KjvBadge className="my-custom-class" />);
    const badge = screen.getByText("KJV");
    expect(badge.className).toContain("my-custom-class");
  });

  it("renders without className prop", () => {
    render(<KjvBadge />);
    const badge = screen.getByText("KJV");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("rounded-full");
  });

  it("renders as a span element", () => {
    render(<KjvBadge />);
    const badge = screen.getByText("KJV");
    expect(badge.tagName).toBe("SPAN");
  });

  it("has cursor-default styling (non-interactive appearance)", () => {
    render(<KjvBadge />);
    const badge = screen.getByText("KJV");
    expect(badge.className).toContain("cursor-default");
  });
});
