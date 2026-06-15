import { describe, expect, it } from "vitest";
import { decideFollowUpDelivery, gradeFollowUp } from "@/features/interview/follow-up-delivery";
import { getFollowUpsForProblem } from "@/features/interview/follow-ups";

// A problem known to have reviewed follow-ups (#176/#181 catalog).
const PROBLEM = "iv.prefix.balance-returns-to-zero";

describe("decideFollowUpDelivery (#181)", () => {
  it("delivers a diagnostic/hint instead of a follow-up when the base solution is wrong", () => {
    const delivery = decideFollowUpDelivery(PROBLEM, { baseSolutionCorrect: false, minutesRemaining: 30 });
    expect(delivery.mode).toBe("diagnostic_hint");
  });

  it("delivers a reviewed follow-up when the base is correct and time fits", () => {
    expect(getFollowUpsForProblem(PROBLEM).length).toBeGreaterThan(0);
    const delivery = decideFollowUpDelivery(PROBLEM, { baseSolutionCorrect: true, minutesRemaining: 60 });
    expect(delivery.mode).toBe("follow_up");
    if (delivery.mode === "follow_up") {
      expect(delivery.followUp.problemId).toBe(PROBLEM);
      expect(delivery.followUp.prompt.length).toBeGreaterThan(0);
    }
  });

  it("reports none when no reviewed follow-up fits the remaining time", () => {
    const delivery = decideFollowUpDelivery(PROBLEM, { baseSolutionCorrect: true, minutesRemaining: 0 });
    expect(delivery.mode).toBe("none");
  });

  it("is deterministic for identical inputs", () => {
    const input = { baseSolutionCorrect: true, minutesRemaining: 45 };
    expect(decideFollowUpDelivery(PROBLEM, input)).toEqual(decideFollowUpDelivery(PROBLEM, input));
  });
});

describe("gradeFollowUp (#181)", () => {
  it("gives full credit for correct reasoning with a finished adaptation", () => {
    const outcome = gradeFollowUp({
      explainedImpactBeforeEdit: true,
      reasoningCorrect: true,
      implementationComplete: true,
      timeExpired: false
    });
    expect(outcome.credit).toBe("full");
  });

  it("gives partial credit for correct reasoning when implementation time expires", () => {
    const outcome = gradeFollowUp({
      explainedImpactBeforeEdit: true,
      reasoningCorrect: true,
      implementationComplete: false,
      timeExpired: true
    });
    expect(outcome.credit).toBe("partial");
  });

  it("gives no credit when the reasoning is incorrect", () => {
    const outcome = gradeFollowUp({
      explainedImpactBeforeEdit: true,
      reasoningCorrect: false,
      implementationComplete: true,
      timeExpired: false
    });
    expect(outcome.credit).toBe("none");
  });

  it("records explained-before-edit without letting it gate credit", () => {
    const base = { reasoningCorrect: true, implementationComplete: true, timeExpired: false };
    const explained = gradeFollowUp({ ...base, explainedImpactBeforeEdit: true });
    const notExplained = gradeFollowUp({ ...base, explainedImpactBeforeEdit: false });
    expect(explained.credit).toBe("full");
    expect(notExplained.credit).toBe("full"); // recorded difference, same credit
    expect(explained.explainedImpactBeforeEdit).toBe(true);
    expect(notExplained.explainedImpactBeforeEdit).toBe(false);
  });
});
