import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeFeedbackPanel } from "@/features/code-lab/code-feedback-panel";
import type { StructuredCodeFeedback } from "@/features/code-lab/code-feedback-types";

const feedback: StructuredCodeFeedback = {
  schemaVersion: 1,
  status: "ok",
  summary: "Your loop stops before the last element.",
  likelyIssue: "Off-by-one in the loop bound.",
  errorTags: ["cpp.loop.off_by_one"],
  relatedSkills: ["cpp.basics.control_flow"],
  nextAction: "try_boundary_case_checklist",
  confidence: "medium",
  learnerMessage: "Check your loop bound.",
  evidenceStrength: "weak_ai_inference"
};

describe("CodeFeedbackPanel", () => {
  it("renders summary, next action, tags, and the advisory weak-evidence note", () => {
    render(<CodeFeedbackPanel feedback={feedback} />);
    expect(screen.getByText(/stops before the last element/)).toBeInTheDocument();
    expect(screen.getByTestId("code-feedback-next-action")).toHaveTextContent(/boundary-case checklist/i);
    expect(screen.getByTestId("code-feedback-tags")).toHaveTextContent("cpp.loop.off_by_one");
    expect(screen.getByTestId("code-feedback")).toHaveTextContent(/advisory only and is not grading evidence/i);
  });

  it("shows the learner message for an unavailable state", () => {
    render(
      <CodeFeedbackPanel
        feedback={{ ...feedback, status: "unavailable", learnerMessage: "AI feedback is not available." }}
      />
    );
    expect(screen.getByTestId("code-feedback")).toHaveTextContent(/not available/i);
  });
});
