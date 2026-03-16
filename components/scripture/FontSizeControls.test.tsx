import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FontSizeControls } from "./FontSizeControls";

const mockIncrease = vi.fn();
const mockDecrease = vi.fn();
let mockFontSize = 20;

vi.mock("@/stores/preferences", () => ({
  usePreferencesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      fontSize: mockFontSize,
      increaseFontSize: mockIncrease,
      decreaseFontSize: mockDecrease,
    }),
}));

describe("FontSizeControls", () => {
  beforeEach(() => {
    mockFontSize = 20;
    mockIncrease.mockClear();
    mockDecrease.mockClear();
  });

  it("renders decrease and increase buttons with ARIA labels", () => {
    render(<FontSizeControls />);
    expect(screen.getByLabelText("Decrease font size")).toBeInTheDocument();
    expect(screen.getByLabelText("Increase font size")).toBeInTheDocument();
  });

  it("displays current font size", () => {
    render(<FontSizeControls />);
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("calls increase handler when A+ is clicked", () => {
    render(<FontSizeControls />);
    fireEvent.click(screen.getByLabelText("Increase font size"));
    expect(mockIncrease).toHaveBeenCalledTimes(1);
  });

  it("calls decrease handler when A- is clicked", () => {
    render(<FontSizeControls />);
    fireEvent.click(screen.getByLabelText("Decrease font size"));
    expect(mockDecrease).toHaveBeenCalledTimes(1);
  });

  it("disables decrease button at minimum font size (14)", () => {
    mockFontSize = 14;
    render(<FontSizeControls />);
    expect(screen.getByLabelText("Decrease font size")).toBeDisabled();
  });

  it("disables increase button at maximum font size (28)", () => {
    mockFontSize = 28;
    render(<FontSizeControls />);
    expect(screen.getByLabelText("Increase font size")).toBeDisabled();
  });

  it("enables both buttons at mid-range font size", () => {
    mockFontSize = 20;
    render(<FontSizeControls />);
    expect(screen.getByLabelText("Decrease font size")).not.toBeDisabled();
    expect(screen.getByLabelText("Increase font size")).not.toBeDisabled();
  });

  it("has correct role=group with label", () => {
    render(<FontSizeControls />);
    const group = screen.getByRole("group", { name: "Font size controls" });
    expect(group).toBeInTheDocument();
  });
});
