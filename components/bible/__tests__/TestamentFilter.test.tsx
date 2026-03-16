import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestamentFilter } from "../TestamentFilter";

describe("TestamentFilter", () => {
  it("renders All, Old Testament, and New Testament options", () => {
    render(<TestamentFilter value="ALL" onChange={() => {}} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Old Testament")).toBeInTheDocument();
    expect(screen.getByText("New Testament")).toBeInTheDocument();
  });

  it("has a radiogroup with accessible label", () => {
    render(<TestamentFilter value="ALL" onChange={() => {}} />);
    const group = screen.getByRole("radiogroup", { name: /filter by testament/i });
    expect(group).toBeInTheDocument();
  });

  it("marks the active option as aria-checked", () => {
    render(<TestamentFilter value="OT" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");

    const otRadio = radios.find((r) => r.textContent === "Old Testament");
    const allRadio = radios.find((r) => r.textContent === "All");

    expect(otRadio).toHaveAttribute("aria-checked", "true");
    expect(allRadio).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the correct value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TestamentFilter value="ALL" onChange={onChange} />);

    await user.click(screen.getByText("New Testament"));
    expect(onChange).toHaveBeenCalledWith("NT");

    await user.click(screen.getByText("Old Testament"));
    expect(onChange).toHaveBeenCalledWith("OT");

    await user.click(screen.getByText("All"));
    expect(onChange).toHaveBeenCalledWith("ALL");
  });
});
