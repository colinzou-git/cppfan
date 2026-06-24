import { describe, expect, it } from "vitest";
import { AI_CHAT_SOURCE_KINDS } from "@/features/ai-chat/ai-chat-types";

describe("AI chat source coverage", () => {
  it("covers every supported learner activity family", () => {
    expect(AI_CHAT_SOURCE_KINDS).toEqual([
      "learning_item",
      "quiz_question",
      "review_question",
      "guided_exercise",
      "write_code_exercise",
      "lab_item",
      "capstone_milestone",
      "project_lab",
      "interview_question",
      "timed_interview_question"
    ]);
  });
});
