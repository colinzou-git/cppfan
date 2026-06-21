import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoundaryChecklistPanel } from "@/features/code-lab/boundary-checklist";
import type { BoundaryChecklist } from "@/features/code-lab/boundary-checklist-types";

const checklists: BoundaryChecklist[] = [
  {
    id: "demo",
    title: "Demo cases",
    skillIds: [],
    items: [
      { id: "empty", label: "empty input", sampleInput: "" },
      { id: "one", label: "one element" }
    ]
  }
];

describe("BoundaryChecklistPanel", () => {
  it("explains items are strategy hints and toggles items when expanded", () => {
    render(<BoundaryChecklistPanel checklists={checklists} defaultExpanded />);
    expect(screen.getByTestId("boundary-checklist")).toHaveTextContent(/not grading criteria/i);
    const [first] = screen.getAllByTestId("boundary-checklist-item");
    expect(first).not.toBeChecked();
    fireEvent.click(first);
    expect(first).toBeChecked();
  });

  it("calls onUseSampleInput with the item's sample input", () => {
    const onUse = vi.fn();
    render(<BoundaryChecklistPanel checklists={checklists} onUseSampleInput={onUse} defaultExpanded />);
    fireEvent.click(screen.getByTestId("boundary-checklist-use-input"));
    expect(onUse).toHaveBeenCalledWith("");
  });

  it("renders nothing when there are no checklists", () => {
    const { container } = render(<BoundaryChecklistPanel checklists={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
