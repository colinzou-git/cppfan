import { describe, expect, it } from "vitest";
import {
  computeReadiness,
  isIndependentUnseenSuccess,
  selectNextPattern,
  type InterviewEvidence
} from "@/features/interview/readiness";
import type { ProblemGroup } from "@/features/interview/problem-catalog";

const NOW = 1_760_000_000_000; // fixed "now" in ms
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => NOW - n * DAY;

function ev(over: Partial<InterviewEvidence> = {}): InterviewEvidence {
  return {
    pattern: "arrays_hashing_prefix",
    problemId: "p1",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs: daysAgo(1),
    ...over
  };
}

const GOOD_QUALITY = { testing: 3, complexity: 3, communication: 3 };

describe("interview evidence independence (#180)", () => {
  it("counts only unhinted first-seen successes in independent/mock contexts", () => {
    expect(isIndependentUnseenSuccess(ev())).toBe(true);
    expect(isIndependentUnseenSuccess(ev({ unseen: false }))).toBe(false); // memorized/repeated
    expect(isIndependentUnseenSuccess(ev({ hintsUsed: 2 }))).toBe(false); // hint-heavy
    expect(isIndependentUnseenSuccess(ev({ context: "guided" }))).toBe(false);
    expect(isIndependentUnseenSuccess(ev({ correct: false }))).toBe(false);
  });
});

describe("readiness verdict (#180)", () => {
  function readyEvidence(): InterviewEvidence[] {
    const groups: ProblemGroup[] = ["arrays_hashing_prefix", "graphs_paths", "heaps_topk_streaming", "intervals_sweepline"];
    // One independent unseen success per pattern, spread across distinct days.
    return groups.map((g, i) =>
      ev({ pattern: g, problemId: `p-${g}`, completedAtMs: daysAgo(i + 1) })
    );
  }

  it("is `not_enough_evidence` with little recent evidence and few mocks", () => {
    const r = computeReadiness([ev()], 0, GOOD_QUALITY, { now: NOW });
    expect(r.verdict).toBe("not_enough_evidence");
  });

  it("is `ready` only when every dimension is met", () => {
    const r = computeReadiness(readyEvidence(), 3, GOOD_QUALITY, { now: NOW });
    expect(r.verdict).toBe("ready");
    expect(Object.values(r.dimensions).every((d) => d === "met")).toBe(true);
  });

  it("memorized/repeated problems do not satisfy the unseen requirement", () => {
    const seen = readyEvidence().map((e) => ({ ...e, unseen: false }));
    const r = computeReadiness(seen, 3, GOOD_QUALITY, { now: NOW });
    expect(r.dimensions.unseen_problem_success).toBe("unmet");
    expect(r.verdict).toBe("not_ready");
  });

  it("hint-heavy success gives reduced independence evidence", () => {
    const hinted = readyEvidence().map((e) => ({ ...e, hintsUsed: 3 }));
    const r = computeReadiness(hinted, 3, GOOD_QUALITY, { now: NOW });
    expect(r.dimensions.unseen_problem_success).toBe("unmet");
  });

  it("stale success does not count; recovery after recent independent success does", () => {
    const stale = readyEvidence().map((e) => ({ ...e, completedAtMs: daysAgo(90) }));
    expect(computeReadiness(stale, 3, GOOD_QUALITY, { now: NOW }).dimensions.unseen_problem_success).not.toBe("met");
    // Add recent independent successes back -> recovers.
    const recovered = [...stale, ...readyEvidence()];
    expect(computeReadiness(recovered, 3, GOOD_QUALITY, { now: NOW }).dimensions.unseen_problem_success).toBe("met");
  });

  it("a pattern that always fails recently is a critical weak cluster", () => {
    const evidence = [
      ...readyEvidence(),
      ev({ pattern: "dp_backtracking", problemId: "dp1", correct: false, completedAtMs: daysAgo(2) }),
      ev({ pattern: "dp_backtracking", problemId: "dp2", correct: false, completedAtMs: daysAgo(1) })
    ];
    const r = computeReadiness(evidence, 3, GOOD_QUALITY, { now: NOW });
    expect(r.dimensions.no_critical_weak_cluster).toBe("unmet");
    expect(r.verdict).toBe("not_ready");
  });

  it("reports quality as not_enough_evidence when rubric scores are missing", () => {
    const r = computeReadiness(readyEvidence(), 3, {}, { now: NOW });
    expect(r.dimensions.quality_scores).toBe("not_enough_evidence");
  });

  it("is deterministic for identical inputs", () => {
    const e = readyEvidence();
    expect(computeReadiness(e, 3, GOOD_QUALITY, { now: NOW })).toEqual(
      computeReadiness(e, 3, GOOD_QUALITY, { now: NOW })
    );
  });
});

describe("deterministic next-pattern selection (#180)", () => {
  const candidates: ProblemGroup[] = ["arrays_hashing_prefix", "graphs_paths", "heaps_topk_streaming"];

  it("prioritizes a pattern with no independent unseen success", () => {
    const evidence = [
      ev({ pattern: "arrays_hashing_prefix" }),
      ev({ pattern: "graphs_paths" })
      // heaps has no evidence at all -> missing unseen success
    ];
    expect(selectNextPattern(evidence, candidates, NOW)?.pattern).toBe("heaps_topk_streaming");
  });

  it("does not starve secondary patterns: interleaves away from the just-practiced one", () => {
    // All have unseen success; the most recent was graphs -> pick a different stale one.
    const evidence: InterviewEvidence[] = [
      ev({ pattern: "arrays_hashing_prefix", problemId: "a", completedAtMs: daysAgo(10) }),
      ev({ pattern: "heaps_topk_streaming", problemId: "h", completedAtMs: daysAgo(8) }),
      ev({ pattern: "graphs_paths", problemId: "g", completedAtMs: daysAgo(1) })
    ];
    expect(selectNextPattern(evidence, candidates, NOW)?.pattern).not.toBe("graphs_paths");
  });

  it("returns null when there are no candidates", () => {
    expect(selectNextPattern([], [], NOW)).toBeNull();
  });
});
