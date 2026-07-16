/*
 * Structured AI authoring proposals for user-created interview problems (#490).
 * Mirrors the exercise/lab authoring modules: the assistant returns fenced JSON
 * operations that the editor applies per-item on accept — it never overwrites
 * fields directly. Pure and I/O-free.
 */

import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_EVALUATION_MODES,
  INTERVIEW_LIMITS,
  type InterviewProblemPayload,
  type VisibleExample
} from "./interview-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

const REPLACEABLE_FIELDS = [
  "title",
  "statement",
  "starterCode",
  "referenceSolution",
  "solutionExplanation",
  "constraints",
  "targetComplexity",
  "aiRubric"
] as const;
type ReplaceableField = (typeof REPLACEABLE_FIELDS)[number];

export type InterviewAuthoringOperation =
  | { type: "replace_field"; field: ReplaceableField; value: string }
  | { type: "set_difficulty"; value: (typeof INTERVIEW_DIFFICULTIES)[number] }
  | { type: "set_evaluation_mode"; value: (typeof INTERVIEW_EVALUATION_MODES)[number] }
  | { type: "set_tags"; value: string[] }
  | { type: "set_pattern_tags"; value: string[] }
  | { type: "add_hint"; value: string }
  | { type: "add_example"; input: string; output: string; note?: string }
  | { type: "add_test"; name: string; input: string; expectedOutput: string; hidden: boolean };

export type IdentifiedInterviewOperation = InterviewAuthoringOperation & { id: string };

export type InterviewAuthoringProposal = {
  summary: string;
  operations: IdentifiedInterviewOperation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, max);
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return undefined;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

function boundedTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, INTERVIEW_LIMITS.maxTags)
    .map((t) => t.trim().slice(0, INTERVIEW_LIMITS.tagMaxLength));
}

function parseOperation(raw: unknown): InterviewAuthoringOperation | null {
  if (!isRecord(raw)) return null;
  const F = INTERVIEW_LIMITS.fieldMaxLength;
  switch (raw.type) {
    case "replace_field": {
      if (!(REPLACEABLE_FIELDS as readonly string[]).includes(raw.field as string)) return null;
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "replace_field", field: raw.field as ReplaceableField, value };
    }
    case "set_difficulty": {
      if (!(INTERVIEW_DIFFICULTIES as readonly string[]).includes(raw.value as string)) return null;
      return { type: "set_difficulty", value: raw.value as (typeof INTERVIEW_DIFFICULTIES)[number] };
    }
    case "set_evaluation_mode": {
      if (!(INTERVIEW_EVALUATION_MODES as readonly string[]).includes(raw.value as string)) return null;
      return { type: "set_evaluation_mode", value: raw.value as (typeof INTERVIEW_EVALUATION_MODES)[number] };
    }
    case "set_tags":
      return { type: "set_tags", value: boundedTags(raw.value) };
    case "set_pattern_tags":
      return { type: "set_pattern_tags", value: boundedTags(raw.value) };
    case "add_hint": {
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "add_hint", value };
    }
    case "add_example": {
      const input = typeof raw.input === "string" ? raw.input.slice(0, F) : "";
      const output = typeof raw.output === "string" ? raw.output.slice(0, F) : "";
      const note = boundedString(raw.note, F);
      return { type: "add_example", input, output, ...(note ? { note } : {}) };
    }
    case "add_test": {
      const name = boundedString(raw.name, INTERVIEW_LIMITS.titleMaxLength) ?? "Test";
      const input = typeof raw.input === "string" ? raw.input.slice(0, F) : "";
      const expectedOutput = typeof raw.expectedOutput === "string" ? raw.expectedOutput.slice(0, F) : "";
      return { type: "add_test", name, input, expectedOutput, hidden: raw.hidden === true };
    }
    default:
      return null;
  }
}

/** Parse a provider proposal (fenced JSON) into a bounded, id-tagged proposal. */
export function parseInterviewAuthoringProposal(text: unknown): ParseResult<InterviewAuthoringProposal> {
  if (typeof text !== "string") {
    return { ok: false, issues: [{ field: "proposal", message: "proposal must be text" }] };
  }
  const json = extractJson(text);
  if (!isRecord(json)) {
    return { ok: false, issues: [{ field: "proposal", message: "no JSON proposal found" }] };
  }
  const summary = boundedString(json.summary, INTERVIEW_LIMITS.fieldMaxLength) ?? "";
  const rawOps = Array.isArray(json.operations) ? json.operations : [];
  const operations: IdentifiedInterviewOperation[] = [];
  rawOps.forEach((raw, i) => {
    const op = parseOperation(raw);
    if (op) operations.push({ ...op, id: `op-${i}` });
  });
  if (operations.length === 0) {
    return { ok: false, issues: [{ field: "operations", message: "proposal has no valid operations" }] };
  }
  return { ok: true, value: { summary, operations } };
}

/** Apply the accepted operations onto a COPY of the payload (never mutates). */
export function applyAcceptedInterviewOperations(
  payload: InterviewProblemPayload,
  operations: InterviewAuthoringOperation[]
): InterviewProblemPayload {
  const next: InterviewProblemPayload = { ...payload };
  for (const op of operations) {
    switch (op.type) {
      case "replace_field":
        (next[op.field] as string) = op.value;
        break;
      case "set_difficulty":
        next.difficulty = op.value;
        break;
      case "set_evaluation_mode":
        next.evaluationMode = op.value;
        break;
      case "set_tags":
        next.tags = [...op.value];
        break;
      case "set_pattern_tags":
        next.patternTags = [...op.value];
        break;
      case "add_hint":
        next.hintLadder = [...(next.hintLadder ?? []), op.value];
        break;
      case "add_example": {
        const example: VisibleExample = { input: op.input, output: op.output, ...(op.note ? { note: op.note } : {}) };
        next.visibleExamples = [...(next.visibleExamples ?? []), example];
        break;
      }
      case "add_test":
        next.tests = [...(next.tests ?? []), { name: op.name, input: op.input, expectedOutput: op.expectedOutput, hidden: op.hidden }];
        break;
      default:
        break;
    }
  }
  return next;
}

/** One-line description of a proposed operation for the accept/reject list. */
export function describeInterviewOperation(op: InterviewAuthoringOperation): string {
  switch (op.type) {
    case "replace_field":
      return `Replace ${op.field}`;
    case "set_difficulty":
      return `Set difficulty: ${op.value}`;
    case "set_evaluation_mode":
      return `Set evaluation: ${op.value}`;
    case "set_tags":
      return `Set tags: ${op.value.join(", ")}`;
    case "set_pattern_tags":
      return `Set pattern tags: ${op.value.join(", ")}`;
    case "add_hint":
      return `Add hint: "${op.value.slice(0, 60)}"`;
    case "add_example":
      return `Add example: ${op.input} → ${op.output}`;
    case "add_test":
      return `Add test: "${op.name}"${op.hidden ? " (hidden)" : ""}`;
    default:
      return "Change";
  }
}

/** Non-blocking sanity issues for a proposal. */
export function validateInterviewAuthoringProposal(proposal: InterviewAuthoringProposal): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (proposal.operations.length === 0) {
    issues.push({ field: "operations", message: "proposal has no operations" });
  }
  return issues;
}
