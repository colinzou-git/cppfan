import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorRemediationPanel } from "@/features/code-lab/error-remediation-panel";
import type { CodeRemediationRecommendation } from "@/features/code-lab/error-remediation-types";

const rec: CodeRemediationRecommendation = {
  id: "i:dsa.binary_search.boundary_update",
  itemId: "i",
  primaryTag: "dsa.binary_search.boundary_update",
  relatedSkillIds: [],
  action: "use_boundary_checklist",
  title: "Practice binary-search boundary updates",
  reason: "your last 2 attempts failed boundary tests",
  priority: "high",
  checklistId: "binary_search"
};

describe("ErrorRemediationPanel", () => {
  it("shows the recommendation, reason, and an action, and can be dismissed", () => {
    const onAction = vi.fn();
    render(<ErrorRemediationPanel recommendation={rec} onAction={onAction} />);
    const panel = screen.getByTestId("code-remediation");
    expect(panel).toHaveAttribute("data-priority", "high");
    expect(panel).toHaveTextContent(/boundary updates/i);
    expect(panel).toHaveTextContent(/Reason:/i);

    fireEvent.click(screen.getByTestId("code-remediation-action"));
    expect(onAction).toHaveBeenCalledWith(rec);

    // Dismissible — no hard lock.
    fireEvent.click(screen.getByTestId("code-remediation-dismiss"));
    expect(screen.queryByTestId("code-remediation")).not.toBeInTheDocument();
  });

  it("renders nothing without a recommendation", () => {
    const { container } = render(<ErrorRemediationPanel recommendation={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
