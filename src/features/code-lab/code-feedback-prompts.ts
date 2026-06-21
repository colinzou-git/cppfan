import { CODE_ERROR_TAGS } from "./code-error-tags";
import { CODE_FEEDBACK_NEXT_ACTIONS } from "./code-feedback-types";

/**
 * System-prompt builders for structured Code Lab feedback (#410). Both require
 * JSON-only output and embed the allowed error-tag and next-action vocabularies
 * so the model cannot invent tags. Item/code context is supplied separately as
 * the user message by the calling service; hidden test details are never passed
 * except as aggregate pass/fail summaries.
 */

export type CodeReviewPromptInput = { hasFailingTests?: boolean };
export type CodeTracePromptInput = { hasSelectedTest?: boolean };

const TAG_LIST = CODE_ERROR_TAGS.join(", ");
const ACTION_LIST = CODE_FEEDBACK_NEXT_ACTIONS.join(", ");

const SHARED_RULES = [
  "Deterministic compiler output and test results are authoritative; your tags and guesses are advisory weak evidence only and must never claim to change grading.",
  `Choose errorTags ONLY from this fixed list (omit any that do not clearly apply): ${TAG_LIST}.`,
  `nextAction must be one of: ${ACTION_LIST}.`,
  "Never invent compiler/runtime output or hidden tests. Give hints before full solutions.",
  "Respond with a single JSON object and nothing else."
];

const FEEDBACK_SHAPE =
  '{"summary": string, "likelyIssue": string, "errorTags": string[], "relatedSkills": string[], "nextAction": string, "confidence": "low"|"medium"|"high", "learnerMessage": string}';

export function buildStructuredCodeReviewPrompt(input: CodeReviewPromptInput = {}): string {
  return [
    "You are cppFan's C++ tutor reviewing a beginner's submission.",
    "Give short, encouraging, hint-first feedback — do not paste a full corrected solution unless explicitly asked.",
    input.hasFailingTests
      ? "Some visible tests failed; focus your summary on the most likely cause."
      : "",
    ...SHARED_RULES,
    `JSON shape: ${FEEDBACK_SHAPE}.`
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildStructuredCodeTracePrompt(input: CodeTracePromptInput = {}): string {
  return [
    "You are cppFan's C++ tutor producing an APPROXIMATE educational execution trace for a beginner.",
    "This is NOT a debugger or real runtime inspection — be explicit that it is approximate.",
    input.hasSelectedTest
      ? "Trace the selected visible test case."
      : "Trace the current input.",
    "Prefer compact steps; show only variables that matter; use line hints only when clear.",
    "If the code does not compile, return an empty steps array and explain the compile blocker in likelyIssue.",
    ...SHARED_RULES,
    `JSON shape: {"codeSummary": string, "inputSummary": string, "steps": [{"step": number, "lineHint": string, "variables": {"name":"value"}, "explanation": string}], "likelyIssue": string, "errorTags": string[], "relatedSkills": string[], "nextAction": string, "confidence": "low"|"medium"|"high", "learnerMessage": string}.`
  ]
    .filter(Boolean)
    .join(" ");
}
