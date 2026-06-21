import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiTracePanel } from "@/features/code-lab/ai-trace-panel";
import { CODE_TRACE_DISCLAIMER, type CodeTraceResult } from "@/features/code-lab/code-trace-types";

const okTrace: CodeTraceResult = {
  status: "ok",
  codeSummary: "Sums a vector of numbers.",
  inputSummary: "visible test 2",
  steps: [
    { step: 1, lineHint: "line 6", variables: { i: "0", sum: "0" }, explanation: "Loop starts" },
    { step: 2, lineHint: "line 7", variables: { sum: "3" }, explanation: "Adds nums[0]" }
  ],
  likelyIssue: "Off-by-one in the loop bound.",
  nextHint: "Check the loop condition.",
  relatedSkills: ["cpp.loops"],
  confidence: "medium",
  disclaimer: CODE_TRACE_DISCLAIMER
};

describe("AiTracePanel", () => {
  it("renders the disclaimer and steps for a successful trace", () => {
    render(<AiTracePanel trace={okTrace} pending={false} />);
    expect(screen.getByTestId("trace-disclaimer")).toHaveTextContent(/AI-generated trace/i);
    expect(screen.getByTestId("trace-steps").querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText(/Off-by-one/)).toBeInTheDocument();
  });

  it("shows a pending state while tracing", () => {
    render(<AiTracePanel trace={null} pending={true} />);
    expect(screen.getByTestId("code-ai-trace")).toHaveTextContent(/Building an AI trace/i);
  });

  it("shows the unavailable message without a disclaimer or steps", () => {
    render(
      <AiTracePanel
        trace={{
          status: "unavailable",
          steps: [],
          confidence: "low",
          disclaimer: CODE_TRACE_DISCLAIMER,
          message: "AI trace is not available right now."
        }}
        pending={false}
      />
    );
    expect(screen.getByTestId("code-ai-trace")).toHaveTextContent(/not available/i);
    expect(screen.queryByTestId("trace-disclaimer")).not.toBeInTheDocument();
  });
});
