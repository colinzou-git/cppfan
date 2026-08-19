import { describe, expect, it } from "vitest";
import { isSuccessfulAcquisitionEvent } from "@/features/goals/acquisition-evidence";

describe("typed exact-item acquisition evidence", () => {
  it("accepts only lesson_self_assessed for a lesson", () => {
    expect(isSuccessfulAcquisitionEvent("lesson", { event_type: "lesson_self_assessed" })).toBe(
      true
    );
    expect(isSuccessfulAcquisitionEvent("lesson", { event_type: "lesson_started" })).toBe(false);
    expect(isSuccessfulAcquisitionEvent("lesson", { event_type: "concept_seen" })).toBe(false);
    expect(isSuccessfulAcquisitionEvent("lesson", { event_type: "review_completed" })).toBe(false);
    expect(isSuccessfulAcquisitionEvent("lesson", { event_type: "code_passed" })).toBe(false);
  });

  it("requires a successful outcome for reconstruction items", () => {
    expect(
      isSuccessfulAcquisitionEvent("completion", {
        event_type: "completion_submitted",
        metadata: { is_correct: true }
      })
    ).toBe(true);
    expect(
      isSuccessfulAcquisitionEvent("completion", {
        event_type: "completion_submitted",
        metadata: { is_correct: false }
      })
    ).toBe(false);
    expect(
      isSuccessfulAcquisitionEvent("parsons", {
        event_type: "parsons_submitted",
        metadata: { is_correct: true }
      })
    ).toBe(true);
    expect(isSuccessfulAcquisitionEvent("parsons", { event_type: "parsons_checked" })).toBe(false);
  });
});
