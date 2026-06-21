import { describe, expect, it } from "vitest";
import {
  fallbackPlainTextFeedback,
  normalizeCodeErrorTags,
  parseStructuredCodeFeedback
} from "@/features/code-lab/code-feedback-parser";

describe("normalizeCodeErrorTags", () => {
  it("keeps known tags and discards unknown ones", () => {
    expect(
      normalizeCodeErrorTags(["cpp.loop.off_by_one", "made.up.tag", "cpp.vector.out_of_bounds", 7])
    ).toEqual(["cpp.loop.off_by_one", "cpp.vector.out_of_bounds"]);
  });

  it("returns an empty array for non-arrays", () => {
    expect(normalizeCodeErrorTags("cpp.loop.off_by_one")).toEqual([]);
    expect(normalizeCodeErrorTags(undefined)).toEqual([]);
  });
});

describe("parseStructuredCodeFeedback", () => {
  it("parses valid structured JSON and clamps confidence/nextAction", () => {
    const feedback = parseStructuredCodeFeedback(
      JSON.stringify({
        summary: "Loop stops too early.",
        likelyIssue: "Off-by-one",
        errorTags: ["cpp.loop.off_by_one", "nonsense.tag"],
        relatedSkills: ["cpp.basics.control_flow"],
        nextAction: "try_boundary_case_checklist",
        confidence: "medium",
        learnerMessage: "Check your loop bound."
      })
    );
    expect(feedback.status).toBe("ok");
    expect(feedback.errorTags).toEqual(["cpp.loop.off_by_one"]);
    expect(feedback.nextAction).toBe("try_boundary_case_checklist");
    expect(feedback.confidence).toBe("medium");
    expect(feedback.evidenceStrength).toBe("weak_ai_inference");
    expect(feedback.schemaVersion).toBe(1);
  });

  it("clamps an unknown nextAction and confidence to safe defaults", () => {
    const feedback = parseStructuredCodeFeedback(
      JSON.stringify({ summary: "x", nextAction: "delete_everything", confidence: "extreme" })
    );
    expect(feedback.nextAction).toBeUndefined();
    expect(feedback.confidence).toBe("low");
  });

  it("falls back cleanly on malformed JSON and never throws", () => {
    const feedback = parseStructuredCodeFeedback("not json, just prose advice");
    expect(feedback.status).toBe("invalid");
    expect(feedback.learnerMessage).toContain("prose advice");
  });

  it("reports unavailable for empty output", () => {
    expect(parseStructuredCodeFeedback("   ").status).toBe("unavailable");
  });
});

describe("fallbackPlainTextFeedback", () => {
  it("marks prose as invalid weak evidence", () => {
    const feedback = fallbackPlainTextFeedback("try a smaller input");
    expect(feedback.status).toBe("invalid");
    expect(feedback.errorTags).toEqual([]);
    expect(feedback.evidenceStrength).toBe("weak_ai_inference");
  });
});
