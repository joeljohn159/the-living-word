import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ChapterKeyboardNav } from "./ChapterKeyboardNav";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const prevLink = { bookSlug: "genesis", bookName: "Genesis", chapter: 2 };
const nextLink = { bookSlug: "genesis", bookName: "Genesis", chapter: 4 };

describe("ChapterKeyboardNav", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("navigates to previous chapter on ArrowLeft", () => {
    render(<ChapterKeyboardNav prev={prevLink} next={nextLink} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(mockPush).toHaveBeenCalledWith("/bible/genesis/2");
  });

  it("navigates to next chapter on ArrowRight", () => {
    render(<ChapterKeyboardNav prev={prevLink} next={nextLink} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(mockPush).toHaveBeenCalledWith("/bible/genesis/4");
  });

  it("does not navigate left when prev is null", () => {
    render(<ChapterKeyboardNav prev={null} next={nextLink} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate right when next is null", () => {
    render(<ChapterKeyboardNav prev={prevLink} next={null} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("ignores keyboard events when typing in an input", () => {
    render(
      <div>
        <input data-testid="text-input" />
        <ChapterKeyboardNav prev={prevLink} next={nextLink} />
      </div>
    );

    const input = document.querySelector("input")!;
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("ignores keyboard events when typing in a textarea", () => {
    render(
      <div>
        <textarea data-testid="text-area" />
        <ChapterKeyboardNav prev={prevLink} next={nextLink} />
      </div>
    );

    const textarea = document.querySelector("textarea")!;
    fireEvent.keyDown(textarea, { key: "ArrowRight" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("ignores unrelated keys", () => {
    render(<ChapterKeyboardNav prev={prevLink} next={nextLink} />);
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "a" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders nothing (returns null)", () => {
    const { container } = render(
      <ChapterKeyboardNav prev={prevLink} next={nextLink} />
    );
    expect(container.innerHTML).toBe("");
  });
});
