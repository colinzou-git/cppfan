import { describe, expect, it } from "vitest";
import {
  shouldRecordStrongCodeEvidence,
  toCodeAttemptSkillEvents
} from "@/features/code-lab/code-attempt-evidence";
import type { CodeTagClassification } from "@/features/code-lab/code-error-tags";

const compiler: CodeTagClassification = {
  tag: "cpp.compile.syntax",
  source: "compiler",
  confidence: "high",
  message: "x"
};
const aiTag: CodeTagClassification = {
  tag: "cpp.loop.off_by_one",
  source: "ai",
  confidence: "high",
  message: "x"
};
const weakTest: CodeTagClassification = {
  tag: "cpp.loop.off_by_one",
  source: "test",
  confidence: "low",
  message: "x"
};

describe("shouldRecordStrongCodeEvidence", () => {
  it("treats deterministic medium/high tags as strong", () => {
    expect(shouldRecordStrongCodeEvidence(compiler)).toBe(true);
  });
  it("never treats AI tags as strong", () => {
    expect(shouldRecordStrongCodeEvidence(aiTag)).toBe(false);
  });
  it("does not treat low-confidence deterministic tags as strong", () => {
    expect(shouldRecordStrongCodeEvidence(weakTest)).toBe(false);
  });
});

describe("toCodeAttemptSkillEvents", () => {
  it("maps classifications to drafts with a strong flag", () => {
    const events = toCodeAttemptSkillEvents({
      classifications: [compiler, aiTag],
      primary: compiler
    });
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ eventType: "code_error_tagged", strong: true });
    expect(events[1].strong).toBe(false);
  });
});
