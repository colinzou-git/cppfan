import { describe, expect, it } from "vitest";
import {
  buildMilestoneCompletionEvidence,
  canMarkMilestoneComplete
} from "@/features/labs/code-lab-milestone-service";
import { getCapstoneMilestone } from "@/features/labs/capstone-tracks";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";

const inApp = getCapstoneMilestone("csv-table-summarizer.m1")!;
const manual = getCapstoneMilestone("csv-table-summarizer.m2")!;
const reflectionMilestone = getCapstoneMilestone("maze-route-planner.m1")!;

const testResult = (passed: number, total: number, status: CodeTestResult["status"] = "ok"): CodeTestResult => ({
  status,
  passed,
  total,
  visible: [],
  hiddenPassed: 0,
  hiddenTotal: 0,
  compileOutput: "",
  provider: "mock",
  simulated: true
});

describe("canMarkMilestoneComplete", () => {
  it("allows completion of an in-app milestone when all visible tests pass", () => {
    expect(canMarkMilestoneComplete({ milestone: inApp, testResult: testResult(1, 1) }).ok).toBe(true);
  });

  it("blocks completion with a clear reason when tests fail", () => {
    const gate = canMarkMilestoneComplete({ milestone: inApp, testResult: testResult(0, 1) });
    expect(gate.ok).toBe(false);
    expect(gate.reason).toMatch(/pass all visible tests/i);
  });

  it("blocks completion until tests have been run", () => {
    const gate = canMarkMilestoneComplete({ milestone: inApp });
    expect(gate.ok).toBe(false);
    expect(gate.reason).toMatch(/open code/i);
  });

  it("allows completion from a persisted passing attempt (tests passed on /lab)", () => {
    expect(canMarkMilestoneComplete({ milestone: inApp, hasPassingAttempt: true }).ok).toBe(true);
  });

  it("does not gate manual/Codespaces milestones", () => {
    expect(canMarkMilestoneComplete({ milestone: manual }).ok).toBe(true);
  });

  it("requires a reflection only when the milestone is reflection-verified", () => {
    expect(canMarkMilestoneComplete({ milestone: reflectionMilestone }).ok).toBe(false);
    expect(
      canMarkMilestoneComplete({ milestone: reflectionMilestone, reflection: "vertices are cells" }).ok
    ).toBe(true);
  });
});

describe("buildMilestoneCompletionEvidence", () => {
  it("captures tests, in-app run, and reflection state", () => {
    const evidence = buildMilestoneCompletionEvidence({
      milestone: inApp,
      testResult: testResult(1, 1),
      reflection: "split on commas"
    });
    expect(evidence).toMatchObject({
      milestoneId: "csv-table-summarizer.m1",
      executionMode: "in_app_code_lab",
      testsPassed: 1,
      testsTotal: 1,
      ranInApp: true,
      reflectionSaved: true
    });
  });
});
