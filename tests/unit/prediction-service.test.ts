import { describe, expect, it } from "vitest";
import {
  hasRequiredPredictions,
  isPredictionEnabled,
  shouldRequirePredictionBeforeRun
} from "@/features/code-lab/prediction-service";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import type { CodePredictionPrompt } from "@/features/code-lab/prediction-types";

const base: LearningItemCodeLab = {
  enabled: true,
  language: "cpp",
  mode: "stdin",
  starterCode: "",
  visibleTests: []
};

const prompts: CodePredictionPrompt[] = [
  { id: "stdout", kind: "stdout", label: "out", required: true },
  { id: "failing_test", kind: "failing_test", label: "fail" }
];

describe("prediction mode", () => {
  it("is off by default so normal flow is unaffected", () => {
    expect(isPredictionEnabled(base)).toBe(false);
    expect(shouldRequirePredictionBeforeRun(base)).toBe(false);
  });

  it("detects optional and required modes", () => {
    expect(isPredictionEnabled({ ...base, predictionMode: "optional" })).toBe(true);
    expect(shouldRequirePredictionBeforeRun({ ...base, predictionMode: "optional" })).toBe(false);
    expect(
      shouldRequirePredictionBeforeRun({ ...base, predictionMode: "required_before_run" })
    ).toBe(true);
  });
});

describe("hasRequiredPredictions", () => {
  it("is false until every required prompt is filled", () => {
    expect(hasRequiredPredictions({ prompts, submissions: [] })).toBe(false);
    expect(
      hasRequiredPredictions({
        prompts,
        submissions: [{ promptId: "stdout", value: "  ", createdAt: "" }]
      })
    ).toBe(false);
    expect(
      hasRequiredPredictions({
        prompts,
        submissions: [{ promptId: "stdout", value: "15", createdAt: "" }]
      })
    ).toBe(true);
  });
});
