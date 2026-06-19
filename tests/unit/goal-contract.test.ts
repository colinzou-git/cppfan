import { describe, expect, it } from "vitest";
import {
  inclusiveGoalDurationDays,
  isSupportedGoalDuration,
  isValidIanaTimezone,
  validateStudyGoalRevision,
  type StudyGoalRevisionInput
} from "@/features/goals/goal-contract";
import { classifyGoalMutationRpc } from "@/features/goals/goal-store";

function validInput(): StudyGoalRevisionInput {
  return {
    title: "Finish graph foundations",
    startLocalDate: "2026-06-18",
    endLocalDate: "2026-06-24",
    timezone: "America/Los_Angeles",
    recommendationSource: "manual",
    targets: [
      {
        targetKind: "acquire_skill",
        referenceId: "dsa.graphs.bfs",
        titleSnapshot: "Graph BFS",
        acquisitionContractId: "skill-initial-v1",
        acquisitionContractVersion: 1,
        source: "manual",
        orderIndex: 0
      }
    ]
  };
}

describe("study goal contract", () => {
  it("uses inclusive local calendar dates", () => {
    expect(inclusiveGoalDurationDays("2026-06-18", "2026-06-24")).toBe(7);
    expect(inclusiveGoalDurationDays("2026-03-08", "2026-03-08")).toBe(1);
  });

  it("accepts only 1 through 30 days", () => {
    expect(isSupportedGoalDuration("2026-06-18", "2026-06-18")).toBe(true);
    expect(isSupportedGoalDuration("2026-06-01", "2026-06-30")).toBe(true);
    expect(isSupportedGoalDuration("2026-06-01", "2026-07-01")).toBe(false);
    expect(isSupportedGoalDuration("2026-06-20", "2026-06-19")).toBe(false);
  });

  it("validates real calendar dates and IANA zones", () => {
    expect(inclusiveGoalDurationDays("2026-02-30", "2026-03-01")).toBeNull();
    expect(isValidIanaTimezone("America/Los_Angeles")).toBe(true);
    expect(isValidIanaTimezone("Not/A_Zone")).toBe(false);
  });

  it("rejects duplicate targets and invalid contracts", () => {
    const input = validInput();
    input.targets.push({ ...input.targets[0], orderIndex: 1 });
    input.targets[0].acquisitionContractVersion = 0;
    expect(validateStudyGoalRevision(input)).toEqual(expect.arrayContaining(["target_reference", "target_contract"]));
  });

  it("accepts a valid revision", () => {
    expect(validateStudyGoalRevision(validInput())).toEqual([]);
  });
});

describe("goal mutation RPC classification", () => {
  it("parses a successful idempotent response", () => {
    expect(classifyGoalMutationRpc({
      data: [{ result_goal_id: "goal-1", result_revision_number: 2, replayed: true }],
      error: null
    })).toEqual({ status: "ok", goalId: "goal-1", revisionNumber: 2, replayed: true });
  });

  it("distinguishes stale and idempotency conflicts", () => {
    expect(classifyGoalMutationRpc({ data: null, error: { message: "stale_goal_revision" } }).status).toBe("stale");
    expect(classifyGoalMutationRpc({ data: null, error: { message: "idempotency_conflict" } }).status).toBe("conflict");
  });

  it("does not turn malformed success data into an empty result", () => {
    expect(classifyGoalMutationRpc({ data: [], error: null })).toEqual({ status: "error" });
  });
});
