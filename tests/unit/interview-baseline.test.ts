import { describe, expect, it } from "vitest";
import { compareBaselineToCurrent, hasComparableArea } from "@/features/interview/interview-baseline";
import { diagnosticSections } from "@/features/interview/diagnostic";
import type { InterviewEvidence } from "@/features/interview/readiness";

const section = diagnosticSections[0]; // { id, group } e.g. two_pointers_sliding_window

function ev(overrides: Partial<InterviewEvidence>): InterviewEvidence {
  return {
    pattern: section.group,
    problemId: "p",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs: 0,
    ...overrides
  };
}

describe("compareBaselineToCurrent (#175/#182)", () => {
  it("returns one entry per diagnostic section with unknown trend when nothing logged", () => {
    const cmp = compareBaselineToCurrent({}, []);
    expect(cmp).toHaveLength(diagnosticSections.length);
    expect(cmp.every((c) => c.trend === "unknown")).toBe(true);
    expect(hasComparableArea(cmp)).toBe(false);
  });

  it("computes the current score as the correct rate in the section's group and flags improvement", () => {
    const baseline = { [section.id]: 0.25 };
    const evidence = [
      ev({ problemId: "a", correct: true }),
      ev({ problemId: "b", correct: true }),
      ev({ problemId: "c", correct: false }) // 2/3 ~= 0.67 current
    ];
    const area = compareBaselineToCurrent(baseline, evidence).find((c) => c.sectionId === section.id)!;
    expect(area.baselineScore).toBe(0.25);
    expect(area.currentScore).toBeCloseTo(2 / 3);
    expect(area.trend).toBe("improved"); // delta > 0.1
    expect(hasComparableArea(compareBaselineToCurrent(baseline, evidence))).toBe(true);
  });

  it("flags a decline and steadiness within the band", () => {
    const declined = compareBaselineToCurrent({ [section.id]: 0.9 }, [ev({ correct: false })]).find(
      (c) => c.sectionId === section.id
    )!;
    expect(declined.trend).toBe("declined");

    const steady = compareBaselineToCurrent({ [section.id]: 1 }, [ev({ correct: true })]).find(
      (c) => c.sectionId === section.id
    )!;
    expect(steady.trend).toBe("steady"); // 1.0 vs 1.0
  });

  it("leaves trend unknown when only the baseline (no current evidence) exists", () => {
    const area = compareBaselineToCurrent({ [section.id]: 0.5 }, []).find((c) => c.sectionId === section.id)!;
    expect(area.currentScore).toBeNull();
    expect(area.trend).toBe("unknown");
  });
});
