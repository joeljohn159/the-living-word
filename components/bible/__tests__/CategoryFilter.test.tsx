import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilter } from "../CategoryFilter";

describe("CategoryFilter", () => {
  it("renders All chip plus all 7 category chips", () => {
    render(<CategoryFilter value="ALL" onChange={() => {}} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Law")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Poetry")).toBeInTheDocument();
    expect(screen.getByText("Prophets")).toBeInTheDocument();
    expect(screen.getByText("Gospels")).toBeInTheDocument();
    expect(screen.getByText("Epistles")).toBeInTheDocument();
    expect(screen.getByText("Apocalyptic")).toBeInTheDocument();
  });

  it("has a radiogroup with accessible label", () => {
    render(<CategoryFilter value="ALL" onChange={() => {}} />);
    const group = screen.getByRole("radiogroup", { name: /filter by category/i });
    expect(group).toBeInTheDocument();
  });

  it("marks the active category as aria-checked", () => {
    render(<CategoryFilter value="Poetry" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");

    const poetryRadio = radios.find((r) => r.textContent === "Poetry");
    const allRadio = radios.find((r) => r.textContent === "All");

    expect(poetryRadio).toHaveAttribute("aria-checked", "true");
    expect(allRadio).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the category value when a chip is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryFilter value="ALL" onChange={onChange} />);

    await user.click(screen.getByText("Epistles"));
    expect(onChange).toHaveBeenCalledWith("Epistles");
  });

  it("calls onChange with ALL when the All chip is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryFilter value="Poetry" onChange={onChange} />);

    await user.click(screen.getByText("All"));
    expect(onChange).toHaveBeenCalledWith("ALL");
  });
});
