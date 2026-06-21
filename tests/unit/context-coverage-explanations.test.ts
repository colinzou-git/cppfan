import { describe, expect, it } from "vitest";
import { getCoverageForSkill } from "@/features/mastery/context-coverage";
import {
  explainContextCoverageStatus,
  explainMissingCoverage
} from "@/features/mastery/context-coverage-explanations";
import type { CoverageEvent } from "@/features/mastery/context-coverage-types";

const coverage = (skillId: string, events: CoverageEvent[]) => getCoverageForSkill({ skillId, events });

describe("explainMissingCoverage", () => {
  it("explains the missing delayed review and code practice for a recognition-only code skill", () => {
    const lines = explainMissingCoverage(coverage("cpp.x", [{ event_type: "quiz_correct" }]));
    expect(lines.join(" ")).toMatch(/delayed review/i);
    expect(lines.join(" ")).toMatch(/Code Lab|project milestone/i);
  });

  it("returns no missing items when mastery coverage is satisfied", () => {
    const lines = explainMissingCoverage(
      coverage("cpp.x", [
        { event_type: "quiz_correct" },
        { event_type: "code_passed" },
        { event_type: "review_completed" }
      ])
    );
    expect(lines).toEqual([]);
  });
});

describe("explainContextCoverageStatus", () => {
  it("summarises evidence so far", () => {
    expect(explainContextCoverageStatus(coverage("cpp.x", []))).toMatch(/no practice evidence/i);
    expect(
      explainContextCoverageStatus(coverage("cpp.x", [{ event_type: "quiz_correct" }]))
    ).toMatch(/more contexts are needed/i);
  });
});
