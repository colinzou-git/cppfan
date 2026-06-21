import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PredictionBeforeRun } from "@/features/code-lab/prediction-before-run";
import type { CodePredictionPrompt } from "@/features/code-lab/prediction-types";

const prompts: CodePredictionPrompt[] = [
  { id: "stdout", kind: "stdout", label: "Expected output?", required: true }
];

describe("PredictionBeforeRun", () => {
  it("renders prompts and reports typed changes", () => {
    const onChange = vi.fn();
    render(
      <PredictionBeforeRun
        prompts={prompts}
        values={{}}
        onChange={onChange}
        comparisons={null}
        required
        missingRequired
      />
    );
    fireEvent.change(screen.getByTestId("prediction-input"), { target: { value: "15" } });
    expect(onChange).toHaveBeenCalledWith("stdout", "15");
    // Required note explains why Run is disabled.
    expect(screen.getByTestId("prediction-required-note")).toBeInTheDocument();
  });

  it("shows the comparison result after a run", () => {
    render(
      <PredictionBeforeRun
        prompts={prompts}
        values={{ stdout: "15" }}
        onChange={() => {}}
        comparisons={[{ promptId: "stdout", status: "matched", explanation: "Your stdout prediction matched." }]}
        required={false}
        missingRequired={false}
      />
    );
    const comparison = screen.getByTestId("prediction-comparison");
    expect(comparison).toHaveAttribute("data-status", "matched");
    expect(comparison).toHaveTextContent(/matched/i);
    expect(screen.queryByTestId("prediction-required-note")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no prompts", () => {
    const { container } = render(
      <PredictionBeforeRun
        prompts={[]}
        values={{}}
        onChange={() => {}}
        comparisons={null}
        required={false}
        missingRequired={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
