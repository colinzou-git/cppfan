import { describe, expect, it } from "vitest";
import {
  getCalibrationMockPacks,
  getMockPack,
  getPracticeMockPacks,
  mockPackReferencesAreValid,
  mockPacks
} from "@/features/interview/mock-packs";
import {
  buildReadinessReport,
  readinessStatus
} from "@/features/interview/readiness-report";
import { computeReadiness, type InterviewEvidence } from "@/features/interview/readiness";
import type { ProblemGroup } from "@/features/interview/problem-catalog";

describe("mock pack catalog integrity (#182)", () => {
  it("has unique ids and valid problem/follow-up references", () => {
    expect(new Set(mockPacks.map((p) => p.id)).size).toBe(mockPacks.length);
    for (const pack of mockPacks) {
      expect(mockPackReferencesAreValid(pack), `${pack.id} refs`).toBe(true);
      expect(pack.followUpIds.length).toBeGreaterThanOrEqual(1); // every pack has >=1 follow-up
      expect([45, 50]).toContain(pack.durationMinutes);
      expect(pack.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("reserves a calibration pool that ordinary practice cannot select", () => {
    const practice = new Set(getPracticeMockPacks().map((p) => p.id));
    const calibration = getCalibrationMockPacks();
    expect(calibration.length).toBeGreaterThanOrEqual(1);
    for (const pack of calibration) {
      expect(practice.has(pack.id)).toBe(false);
    }
  });

  it("resolves a pack by id", () => {
    expect(getMockPack("pack.ds.top-k-stream")?.category).toBe("ds_implementation");
    expect(getMockPack("nope")).toBeNull();
  });
});

const NOW = 1_760_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

function ev(over: Partial<InterviewEvidence> = {}): InterviewEvidence {
  return {
    pattern: "arrays_hashing_prefix",
    problemId: "p1",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs: NOW - DAY,
    ...over
  };
}

function readyEvidence(): InterviewEvidence[] {
  const groups: ProblemGroup[] = [
    "arrays_hashing_prefix",
    "graphs_paths",
    "heaps_topk_streaming",
    "intervals_sweepline"
  ];
  return groups.map((g, i) => ev({ pattern: g, problemId: `p-${g}`, completedAtMs: NOW - (i + 1) * DAY }));
}

const GOOD_QUALITY = { testing: 3, complexity: 3, communication: 3 };

describe("readiness report status mapping (#182)", () => {
  it("is not_assessed with too little evidence", () => {
    const report = computeReadiness([ev()], 0, GOOD_QUALITY, { now: NOW });
    expect(readinessStatus(report)).toBe("not_assessed");
  });

  it("is interview_ready only when the #180 gate is fully met", () => {
    const report = computeReadiness(readyEvidence(), 3, GOOD_QUALITY, { now: NOW });
    expect(readinessStatus(report)).toBe("interview_ready");
  });

  it("falls back to refreshing_fundamentals when a critical weak cluster exists", () => {
    const evidence = [
      ...readyEvidence(),
      ev({ pattern: "dp_backtracking", problemId: "d1", correct: false, completedAtMs: NOW - 2 * DAY }),
      ev({ pattern: "dp_backtracking", problemId: "d2", correct: false, completedAtMs: NOW - DAY })
    ];
    const report = computeReadiness(evidence, 3, GOOD_QUALITY, { now: NOW });
    expect(readinessStatus(report)).toBe("refreshing_fundamentals");
  });
});

describe("readiness report view (#182)", () => {
  it("includes status, patterns, an honest disclaimer, and no hiring claim", () => {
    const view = buildReadinessReport(readyEvidence(), 3, GOOD_QUALITY, { now: NOW });
    expect(view.status).toBe("interview_ready");
    expect(view.strongestPatterns.length).toBeGreaterThan(0);
    expect(view.weakestPatterns.length).toBeGreaterThan(0);
    expect(view.disclaimer).toMatch(/not.*predict|not an endorsement/i);
    expect(view.disclaimer.toLowerCase()).not.toContain("guarantee you");
  });

  it("flags stale evidence when nothing is recent", () => {
    const stale = readyEvidence().map((e) => ({ ...e, completedAtMs: NOW - 90 * DAY }));
    const view = buildReadinessReport(stale, 3, GOOD_QUALITY, { now: NOW });
    expect(view.evidenceStale).toBe(true);
    expect(view.status).not.toBe("interview_ready");
  });

  it("is deterministic for identical inputs", () => {
    const e = readyEvidence();
    expect(buildReadinessReport(e, 3, GOOD_QUALITY, { now: NOW })).toEqual(
      buildReadinessReport(e, 3, GOOD_QUALITY, { now: NOW })
    );
  });
});
