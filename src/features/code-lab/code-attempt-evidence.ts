import type { CodeTagClassification } from "./code-error-tags";
import type { CodeAttemptClassification } from "./code-error-classifier";

/**
 * Bridges deterministic classifications to skill-evidence drafts (#412). These
 * are drafts only — this issue intentionally does NOT change mastery scoring or
 * wire events into the ledger; later phases (remediation/mastery) consume them.
 * Deterministic compiler/runtime/test tags may be medium/high evidence; AI tags
 * stay weak.
 */

export type SkillEventDraft = {
  eventType: "code_error_tagged";
  tag: CodeTagClassification["tag"];
  source: CodeTagClassification["source"];
  confidence: CodeTagClassification["confidence"];
  strong: boolean;
};

export function shouldRecordStrongCodeEvidence(classification: CodeTagClassification): boolean {
  return (
    classification.source !== "ai" &&
    (classification.confidence === "medium" || classification.confidence === "high")
  );
}

export function toCodeAttemptSkillEvents(input: CodeAttemptClassification): SkillEventDraft[] {
  return input.classifications.map((classification) => ({
    eventType: "code_error_tagged",
    tag: classification.tag,
    source: classification.source,
    confidence: classification.confidence,
    strong: shouldRecordStrongCodeEvidence(classification)
  }));
}
