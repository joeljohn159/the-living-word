import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge, CATEGORIES } from "../CategoryBadge";

describe("CategoryBadge", () => {
  it.each(["manuscript", "archaeology", "inscription", "artifact"])(
    "renders the %s category with correct label",
    (category) => {
      render(<CategoryBadge category={category} />);
      const expectedLabel =
        category.charAt(0).toUpperCase() + category.slice(1);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it("falls back to artifact config for unknown categories", () => {
    render(<CategoryBadge category="unknown-type" />);
    expect(screen.getByText("Artifact")).toBeInTheDocument();
  });

  it("renders with small size by default", () => {
    const { container } = render(<CategoryBadge category="manuscript" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-xs");
  });

  it("renders with medium size when specified", () => {
    const { container } = render(
      <CategoryBadge category="manuscript" size="md" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-sm");
  });

  it("hides icon from screen readers with aria-hidden", () => {
    const { container } = render(<CategoryBadge category="archaeology" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  describe("CATEGORIES export", () => {
    it("exports all four categories", () => {
      expect(CATEGORIES).toHaveLength(4);
    });

    it("includes value and label for each category", () => {
      const values = CATEGORIES.map((c) => c.value);
      expect(values).toContain("manuscript");
      expect(values).toContain("archaeology");
      expect(values).toContain("inscription");
      expect(values).toContain("artifact");
    });
  });
});
