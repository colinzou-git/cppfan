/*
 * Structured AI authoring proposals for user-created exercises (#488). Mirrors
 * the lesson authoring module: the assistant returns fenced JSON operations that
 * the editor applies per-item on accept — it never overwrites fields directly.
 * Pure and I/O-free.
 */

import { EXERCISE_LIMITS, type ExercisePayload, type ExerciseTest } from "./exercise-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

const REPLACEABLE_FIELDS = [
  "title",
  "prompt",
  "starterCode",
  "sampleCode",
  "referenceSolution",
  "solutionExplanation",
  "functionSignature",
  "stdinFormat",
  "stdoutFormat",
  "complexityTarget"
] as const;
type ReplaceableField = (typeof REPLACEABLE_FIELDS)[number];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export type ExerciseAuthoringOperation =
  | { type: "replace_field"; field: ReplaceableField; value: string }
  | { type: "set_difficulty"; value: (typeof DIFFICULTIES)[number] }
  | { type: "set_tags"; value: string[] }
  | { type: "add_test"; name: string; input: string; expectedOutput: string; hidden: boolean };

export type IdentifiedExerciseOperation = ExerciseAuthoringOperation & { id: string };

export type ExerciseAuthoringProposal = {
  summary: string;
  operations: IdentifiedExerciseOperation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, max);
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    return undefined;
  }
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

function parseOperation(raw: unknown): ExerciseAuthoringOperation | null {
  if (!isRecord(raw)) {
    return null;
  }
  const F = EXERCISE_LIMITS.fieldMaxLength;
  switch (raw.type) {
    case "replace_field": {
      if (!(REPLACEABLE_FIELDS as readonly string[]).includes(raw.field as string)) {
        return null;
      }
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "replace_field", field: raw.field as ReplaceableField, value };
    }
    case "set_difficulty": {
      if (!(DIFFICULTIES as readonly string[]).includes(raw.value as string)) {
        return null;
      }
      return { type: "set_difficulty", value: raw.value as (typeof DIFFICULTIES)[number] };
    }
    case "set_tags": {
      if (!Array.isArray(raw.value)) {
        return null;
      }
      const tags = raw.value
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .slice(0, EXERCISE_LIMITS.maxTags)
        .map((t) => t.trim().slice(0, EXERCISE_LIMITS.tagMaxLength));
      return { type: "set_tags", value: tags };
    }
    case "add_test": {
      const name = boundedString(raw.name, EXERCISE_LIMITS.titleMaxLength) ?? "Test";
      const input = typeof raw.input === "string" ? raw.input.slice(0, F) : "";
      const expectedOutput = typeof raw.expectedOutput === "string" ? raw.expectedOutput.slice(0, F) : "";
      return { type: "add_test", name, input, expectedOutput, hidden: raw.hidden === true };
    }
    default:
      return null;
  }
}

/** Parse a provider proposal (fenced JSON) into a bounded, id-tagged proposal. */
export function parseExerciseAuthoringProposal(text: unknown): ParseResult<ExerciseAuthoringProposal> {
  if (typeof text !== "string") {
    return { ok: false, issues: [{ field: "proposal", message: "proposal must be text" }] };
  }
  const json = extractJson(text);
  if (!isRecord(json)) {
    return { ok: false, issues: [{ field: "proposal", message: "no JSON proposal found" }] };
  }
  const summary = boundedString(json.summary, EXERCISE_LIMITS.fieldMaxLength) ?? "";
  const rawOps = Array.isArray(json.operations) ? json.operations : [];
  const operations: IdentifiedExerciseOperation[] = [];
  rawOps.forEach((raw, i) => {
    const op = parseOperation(raw);
    if (op) {
      operations.push({ ...op, id: `op-${i}` });
    }
  });
  if (operations.length === 0) {
    return { ok: false, issues: [{ field: "operations", message: "proposal has no valid operations" }] };
  }
  return { ok: true, value: { summary, operations } };
}

/** Apply the accepted operations onto a COPY of the payload (never mutates). */
export function applyAcceptedExerciseOperations(
  payload: ExercisePayload,
  operations: ExerciseAuthoringOperation[]
): ExercisePayload {
  const next: ExercisePayload = { ...payload };
  for (const op of operations) {
    switch (op.type) {
      case "replace_field":
        (next[op.field] as string) = op.value;
        break;
      case "set_difficulty":
        next.difficulty = op.value;
        break;
      case "set_tags":
        next.tags = [...op.value];
        break;
      case "add_test": {
        const test: ExerciseTest = { name: op.name, input: op.input, expectedOutput: op.expectedOutput, hidden: op.hidden };
        next.tests = [...(next.tests ?? []), test];
        break;
      }
      default:
        break;
    }
  }
  return next;
}

/** One-line description of a proposed operation for the accept/reject list. */
export function describeExerciseOperation(op: ExerciseAuthoringOperation): string {
  switch (op.type) {
    case "replace_field":
      return `Replace ${op.field}`;
    case "set_difficulty":
      return `Set difficulty: ${op.value}`;
    case "set_tags":
      return `Set tags: ${op.value.join(", ")}`;
    case "add_test":
      return `Add test: "${op.name}"${op.hidden ? " (hidden)" : ""}`;
    default:
      return "Change";
  }
}

/** Non-blocking sanity issues for a proposal. */
export function validateExerciseAuthoringProposal(proposal: ExerciseAuthoringProposal): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (proposal.operations.length === 0) {
    issues.push({ field: "operations", message: "proposal has no operations" });
  }
  return issues;
}
