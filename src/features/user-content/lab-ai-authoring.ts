/*
 * Structured AI authoring proposals for user-created labs (#489). Mirrors the
 * exercise authoring module: the assistant returns fenced JSON operations that
 * the editor applies per-item on accept — it never overwrites fields directly.
 * Pure and I/O-free.
 */

import { LAB_LIMITS, LAB_MODES, type LabMilestone, type LabPayload } from "./lab-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

const REPLACEABLE_FIELDS = [
  "title",
  "summary",
  "taskDescription",
  "starterCode",
  "referenceSolution",
  "solutionExplanation"
] as const;
type ReplaceableField = (typeof REPLACEABLE_FIELDS)[number];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export type LabAuthoringOperation =
  | { type: "replace_field"; field: ReplaceableField; value: string }
  | { type: "set_difficulty"; value: (typeof DIFFICULTIES)[number] }
  | { type: "set_tags"; value: string[] }
  | { type: "set_mode"; value: (typeof LAB_MODES)[number] }
  | { type: "add_milestone"; title: string; instructions: string; required: boolean }
  | { type: "add_completion_test"; name: string; input: string; expectedOutput: string; hidden: boolean };

export type IdentifiedLabOperation = LabAuthoringOperation & { id: string };

export type LabAuthoringProposal = {
  summary: string;
  operations: IdentifiedLabOperation[];
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

function parseOperation(raw: unknown): LabAuthoringOperation | null {
  if (!isRecord(raw)) return null;
  const F = LAB_LIMITS.fieldMaxLength;
  switch (raw.type) {
    case "replace_field": {
      if (!(REPLACEABLE_FIELDS as readonly string[]).includes(raw.field as string)) return null;
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "replace_field", field: raw.field as ReplaceableField, value };
    }
    case "set_difficulty": {
      if (!(DIFFICULTIES as readonly string[]).includes(raw.value as string)) return null;
      return { type: "set_difficulty", value: raw.value as (typeof DIFFICULTIES)[number] };
    }
    case "set_tags": {
      if (!Array.isArray(raw.value)) return null;
      const tags = raw.value
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .slice(0, LAB_LIMITS.maxTags)
        .map((t) => t.trim().slice(0, LAB_LIMITS.tagMaxLength));
      return { type: "set_tags", value: tags };
    }
    case "set_mode": {
      if (!(LAB_MODES as readonly string[]).includes(raw.value as string)) return null;
      return { type: "set_mode", value: raw.value as (typeof LAB_MODES)[number] };
    }
    case "add_milestone": {
      const title = boundedString(raw.title, LAB_LIMITS.titleMaxLength);
      const instructions = boundedString(raw.instructions, F);
      if (!title || !instructions) return null;
      return { type: "add_milestone", title, instructions, required: raw.required !== false };
    }
    case "add_completion_test": {
      const name = boundedString(raw.name, LAB_LIMITS.titleMaxLength) ?? "Test";
      const input = typeof raw.input === "string" ? raw.input.slice(0, F) : "";
      const expectedOutput = typeof raw.expectedOutput === "string" ? raw.expectedOutput.slice(0, F) : "";
      return { type: "add_completion_test", name, input, expectedOutput, hidden: raw.hidden === true };
    }
    default:
      return null;
  }
}

/** Parse a provider proposal (fenced JSON) into a bounded, id-tagged proposal. */
export function parseLabAuthoringProposal(text: unknown): ParseResult<LabAuthoringProposal> {
  if (typeof text !== "string") {
    return { ok: false, issues: [{ field: "proposal", message: "proposal must be text" }] };
  }
  const json = extractJson(text);
  if (!isRecord(json)) {
    return { ok: false, issues: [{ field: "proposal", message: "no JSON proposal found" }] };
  }
  const summary = boundedString(json.summary, LAB_LIMITS.fieldMaxLength) ?? "";
  const rawOps = Array.isArray(json.operations) ? json.operations : [];
  const operations: IdentifiedLabOperation[] = [];
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
export function applyAcceptedLabOperations(payload: LabPayload, operations: LabAuthoringOperation[]): LabPayload {
  const next: LabPayload = { ...payload };
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
      case "set_mode":
        next.mode = op.value;
        break;
      case "add_milestone": {
        const list = next.milestones ?? [];
        const milestone: LabMilestone = {
          id: `m${list.length + 1}`,
          title: op.title,
          instructions: op.instructions,
          required: op.required
        };
        next.milestones = [...list, milestone];
        break;
      }
      case "add_completion_test": {
        const completion = { ...(next.completion ?? {}) };
        completion.tests = [
          ...(completion.tests ?? []),
          { name: op.name, input: op.input, expectedOutput: op.expectedOutput, hidden: op.hidden }
        ];
        next.completion = completion;
        break;
      }
      default:
        break;
    }
  }
  return next;
}

/** One-line description of a proposed operation for the accept/reject list. */
export function describeLabOperation(op: LabAuthoringOperation): string {
  switch (op.type) {
    case "replace_field":
      return `Replace ${op.field}`;
    case "set_difficulty":
      return `Set difficulty: ${op.value}`;
    case "set_tags":
      return `Set tags: ${op.value.join(", ")}`;
    case "set_mode":
      return `Set structure: ${op.value === "single_task" ? "single task" : "milestones"}`;
    case "add_milestone":
      return `Add milestone: "${op.title}"${op.required ? "" : " (optional)"}`;
    case "add_completion_test":
      return `Add test: "${op.name}"${op.hidden ? " (hidden)" : ""}`;
    default:
      return "Change";
  }
}

/** Non-blocking sanity issues for a proposal. */
export function validateLabAuthoringProposal(proposal: LabAuthoringProposal): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (proposal.operations.length === 0) {
    issues.push({ field: "operations", message: "proposal has no operations" });
  }
  return issues;
}
