import { isCodeErrorTag, type CodeErrorTag } from "./code-error-tags";
import {
  CODE_FEEDBACK_NEXT_ACTIONS,
  CODE_FEEDBACK_SCHEMA_VERSION,
  type CodeFeedbackConfidence,
  type CodeFeedbackNextAction,
  type StructuredCodeFeedback
} from "./code-feedback-types";

/**
 * Parsing for structured Code Lab AI feedback (#410). This never throws to the
 * route/UI: malformed or prose output degrades to a usable fallback. Unknown
 * error tags are discarded, and confidence/nextAction are clamped to the allowed
 * vocabularies so downstream consumers can trust the shape.
 */

const UNAVAILABLE_MESSAGE =
  "AI feedback is not available right now. Compiler output and test results are the source of truth.";

export function normalizeCodeErrorTags(tags: unknown): CodeErrorTag[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<CodeErrorTag>();
  for (const tag of tags) {
    if (isCodeErrorTag(tag)) seen.add(tag);
  }
  return [...seen];
}

function clampConfidence(value: unknown): CodeFeedbackConfidence {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function clampNextAction(value: unknown): CodeFeedbackNextAction | undefined {
  return CODE_FEEDBACK_NEXT_ACTIONS.includes(value as CodeFeedbackNextAction)
    ? (value as CodeFeedbackNextAction)
    : undefined;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function extractJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Wrap free-form prose (or an empty/garbled response) as feedback the learner can
 * still read, marked `invalid` so consumers know it is not machine-structured.
 */
export function fallbackPlainTextFeedback(raw: string): StructuredCodeFeedback {
  const text = asString(raw);
  if (!text) {
    return {
      schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
      status: "unavailable",
      summary: "",
      errorTags: [],
      relatedSkills: [],
      confidence: "low",
      learnerMessage: UNAVAILABLE_MESSAGE,
      evidenceStrength: "weak_ai_inference"
    };
  }
  return {
    schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
    status: "invalid",
    summary: text,
    errorTags: [],
    relatedSkills: [],
    confidence: "low",
    learnerMessage: text,
    evidenceStrength: "weak_ai_inference"
  };
}

export function parseStructuredCodeFeedback(raw: string): StructuredCodeFeedback {
  const parsed = extractJson(raw);
  if (!parsed) {
    return fallbackPlainTextFeedback(raw);
  }

  const summary = asString(parsed.summary);
  const likelyIssue = asString(parsed.likelyIssue);
  const learnerMessage = asString(parsed.learnerMessage) || summary;

  // A JSON object with no usable summary/message is treated as prose fallback so
  // the learner still gets something readable.
  if (!summary && !learnerMessage) {
    return fallbackPlainTextFeedback(raw);
  }

  return {
    schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
    status: "ok",
    summary,
    likelyIssue: likelyIssue || undefined,
    errorTags: normalizeCodeErrorTags(parsed.errorTags),
    relatedSkills: asStringArray(parsed.relatedSkills),
    nextAction: clampNextAction(parsed.nextAction),
    confidence: clampConfidence(parsed.confidence),
    learnerMessage: learnerMessage || summary,
    evidenceStrength: "weak_ai_inference"
  };
}
