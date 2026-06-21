import { describe, expect, it } from "vitest";
import { getCoverageForSkill } from "@/features/mastery/context-coverage";
import {
  adjustMasteryForContextCoverage,
  satisfiesMasteredCoverage,
  satisfiesStrongCoverage
} from "@/features/mastery/context-coverage-rules";
import type { CoverageEvent } from "@/features/mastery/context-coverage-types";

const coverage = (skillId: string, events: CoverageEvent[]) => getCoverageForSkill({ skillId, events });

const recognitionOnly: CoverageEvent[] = [{ event_type: "quiz_correct" }, { event_type: "quiz_correct" }];
const multiContextCode: CoverageEvent[] = [
  { event_type: "quiz_correct" },
  { event_type: "code_passed" },
  { event_type: "review_completed" }
];

describe("coverage thresholds", () => {
  it("strong needs at least 2 contexts", () => {
    expect(satisfiesStrongCoverage(coverage("cpp.x", recognitionOnly))).toBe(false);
    expect(satisfiesStrongCoverage(coverage("cpp.x", multiContextCode))).toBe(true);
  });

  it("mastered needs 3 contexts including delayed review and code/project for code skills", () => {
    expect(satisfiesMasteredCoverage(coverage("cpp.x", multiContextCode))).toBe(true);
    // Same three contexts but missing delayed_review -> not mastered-eligible.
    expect(
      satisfiesMasteredCoverage(
        coverage("cpp.x", [
          { event_type: "quiz_correct" },
          { event_type: "code_passed" },
          { event_type: "completion_submitted", metadata: { is_correct: true } }
        ])
      )
    ).toBe(false);
  });

  it("non-code skills do not require code_lab for mastery", () => {
    expect(
      satisfiesMasteredCoverage(
        coverage("meta.study_habits", [
          { event_type: "quiz_correct" },
          { event_type: "completion_submitted", metadata: { is_correct: true } },
          { event_type: "review_completed" }
        ])
      )
    ).toBe(true);
  });
});

describe("adjustMasteryForContextCoverage", () => {
  it("holds a one-context mastered at strong", () => {
    expect(
      adjustMasteryForContextCoverage({
        skillId: "cpp.x",
        currentStatus: "mastered",
        coverage: coverage("cpp.x", recognitionOnly)
      })
    ).toBe("strong");
  });

  it("keeps mastered when multi-context evidence exists", () => {
    expect(
      adjustMasteryForContextCoverage({
        skillId: "cpp.x",
        currentStatus: "mastered",
        coverage: coverage("cpp.x", multiContextCode)
      })
    ).toBe("mastered");
  });

  it("never downgrades non-mastered statuses (no hard locks)", () => {
    for (const status of ["new", "learning", "weak", "reviewing", "strong", "regressed"] as const) {
      expect(
        adjustMasteryForContextCoverage({
          skillId: "cpp.x",
          currentStatus: status,
          coverage: coverage("cpp.x", recognitionOnly)
        })
      ).toBe(status);
    }
  });
});
