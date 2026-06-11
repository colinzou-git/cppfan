import { describe, expect, it } from "vitest";
import { learningLoopSteps } from "@/features/learning/learning-loop";

describe("learningLoopSteps", () => {
  it("keeps review and mastery as separate steps", () => {
    expect(learningLoopSteps).toContain("update_review_schedule");
    expect(learningLoopSteps).toContain("update_mastery");
  });

  it("starts from skill choice and ends with recommendation", () => {
    expect(learningLoopSteps[0]).toBe("choose_skill");
    expect(learningLoopSteps.at(-1)).toBe("recommend_next_action");
  });
});
