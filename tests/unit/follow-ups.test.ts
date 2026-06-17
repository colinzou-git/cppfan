import { describe, expect, it } from "vitest";
import {
  followUps,
  followUpParentIsValid,
  getFollowUpsForProblem,
  selectFollowUp
} from "@/features/interview/follow-ups";
import { RUBRIC_CRITERIA } from "@/features/interview/rubric";

const rubricIds = new Set(RUBRIC_CRITERIA.map((c) => c.id));

describe("follow-up catalog integrity (#181)", () => {
  it("has unique ids", () => {
    const ids = followUps.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references a valid parent problem and version", () => {
    for (const f of followUps) {
      expect(followUpParentIsValid(f), `${f.id} parent`).toBe(true);
    }
  });

  it("targets only real rubric dimensions and has a non-empty prompt + time budget", () => {
    for (const f of followUps) {
      expect(f.prompt.length).toBeGreaterThan(0);
      expect(f.timeBudgetMinutes).toBeGreaterThan(0);
      expect(f.targetRubricDimensions.length).toBeGreaterThan(0);
      for (const d of f.targetRubricDimensions) {
        expect(rubricIds.has(d), `${f.id} dimension ${d}`).toBe(true);
      }
    }
  });

  it("covers systems-relevant, data-structure-change, and debugging variants", () => {
    const kinds = new Set(followUps.map((f) => f.kind));
    // Systems-relevant: streaming / updates / capacity.
    expect(["stream", "support_updates", "incremental_output"].some((k) => kinds.has(k as never))).toBe(true);
    // Requires changing the data structure / complexity.
    expect(["operation_mix_change", "duplicates_or_negatives", "support_updates"].some((k) => kinds.has(k as never))).toBe(true);
    // Primarily debugging / testing / C++ design.
    expect(kinds.has("diagnose_bug")).toBe(true);
  });
});

describe("deterministic follow-up selection (#181)", () => {
  it("returns null when the base solution is still incorrect (use a hint instead)", () => {
    expect(selectFollowUp("iv.heap.top-k-hot-keys", { baseSolutionCorrect: false, minutesRemaining: 30 })).toBeNull();
  });

  it("picks the highest-priority follow-up that fits the remaining time", () => {
    const pick = selectFollowUp("iv.heap.top-k-hot-keys", { baseSolutionCorrect: true, minutesRemaining: 30 });
    expect(pick?.id).toBe("fu.top-k.updates"); // priority 1
  });

  it("falls back to null when no follow-up fits the time budget", () => {
    const pick = selectFollowUp("iv.heap.top-k-hot-keys", { baseSolutionCorrect: true, minutesRemaining: 1 });
    expect(pick).toBeNull();
  });

  it("does not repeat an already-delivered follow-up", () => {
    const pick = selectFollowUp("iv.heap.top-k-hot-keys", {
      baseSolutionCorrect: true,
      minutesRemaining: 30,
      excludeIds: ["fu.top-k.updates"]
    });
    expect(pick?.id).toBe("fu.top-k.incremental"); // next priority
  });

  it("is deterministic for identical inputs", () => {
    const input = { baseSolutionCorrect: true, minutesRemaining: 12 };
    expect(selectFollowUp("iv.graph.service-init-order", input)).toEqual(
      selectFollowUp("iv.graph.service-init-order", input)
    );
  });

  it("every problem with follow-ups exposes at least one", () => {
    for (const f of followUps) {
      expect(getFollowUpsForProblem(f.problemId).length).toBeGreaterThan(0);
    }
  });

  it("is growing toward the #181 first release (>= 22 follow-ups across >= 17 problems)", () => {
    expect(followUps.length).toBeGreaterThanOrEqual(22);
    expect(new Set(followUps.map((f) => f.problemId)).size).toBeGreaterThanOrEqual(17);
  });
});
