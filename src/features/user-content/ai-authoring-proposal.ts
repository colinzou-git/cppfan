/*
 * AI authoring proposals (#487).
 *
 * The AI never overwrites the editor. It returns a structured proposal — a
 * summary plus a list of typed operations — which the UI shows as a diff so the
 * author can accept or reject each one. `parseAuthoringProposal` turns the
 * provider's (possibly fenced) JSON into a bounded proposal; `applyAcceptedOps`
 * folds ONLY the accepted operations onto a COPY of the current payload. Pure
 * and I/O-free.
 */

import {
  LESSON_LIMITS,
  type LessonChoice,
  type LessonPayload,
  type LessonSections,
  type ParseResult,
  type ValidationIssue
} from "./user-content-types";

const REPLACEABLE_FIELDS = [
  "title",
  "content",
  "explanation",
  "difficulty",
  "sourceNotes",
  "sampleCode",
  "starterCode",
  "referenceSolution",
  "expectedOutput",
  "solutionExplanation"
] as const;
type ReplaceableField = (typeof REPLACEABLE_FIELDS)[number];

const SECTION_KEYS = [
  "introduction",
  "syntax",
  "examples",
  "commonMistakes",
  "bestPractices",
  "practice",
  "summary",
  "furtherReading"
] as const;

export type AuthoringOperation =
  | { type: "replace_field"; field: ReplaceableField; value: string }
  | { type: "append_section"; section: keyof LessonSections; value: string }
  | { type: "set_objectives"; value: string[] }
  | { type: "set_tags"; value: string[] }
  | { type: "add_choice"; text: string; isCorrect: boolean }
  | { type: "add_parsons_block"; text: string; correctOrder: number; isDistractor: boolean }
  | { type: "add_completion_blank"; position: number; answer: string }
  | { type: "add_review_card"; prompt: string; choices: LessonChoice[]; explanation?: string };

export type IdentifiedOperation = AuthoringOperation & { id: string };

export type AuthoringProposal = {
  summary: string;
  operations: IdentifiedOperation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value.slice(0, max);
}

/** Extract the first JSON object from possibly fenced provider text. */
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

function parseOperation(raw: unknown): AuthoringOperation | null {
  if (!isRecord(raw) || typeof raw.type !== "string") {
    return null;
  }
  const F = LESSON_LIMITS.fieldMaxLength;
  switch (raw.type) {
    case "replace_field": {
      if (typeof raw.field !== "string" || !(REPLACEABLE_FIELDS as readonly string[]).includes(raw.field)) {
        return null;
      }
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "replace_field", field: raw.field as ReplaceableField, value };
    }
    case "append_section": {
      if (typeof raw.section !== "string" || !(SECTION_KEYS as readonly string[]).includes(raw.section)) {
        return null;
      }
      const value = boundedString(raw.value, F);
      return value === null ? null : { type: "append_section", section: raw.section as keyof LessonSections, value };
    }
    case "set_objectives":
    case "set_tags": {
      if (!Array.isArray(raw.value)) {
        return null;
      }
      const items = raw.value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .slice(0, raw.type === "set_tags" ? LESSON_LIMITS.maxTags : LESSON_LIMITS.maxObjectives);
      return raw.type === "set_tags" ? { type: "set_tags", value: items } : { type: "set_objectives", value: items };
    }
    case "add_choice": {
      const text = boundedString(raw.text, F);
      return text === null ? null : { type: "add_choice", text, isCorrect: raw.isCorrect === true };
    }
    case "add_parsons_block": {
      const text = boundedString(raw.text, F);
      const order = Number(raw.correctOrder);
      return text === null
        ? null
        : {
            type: "add_parsons_block",
            text,
            correctOrder: Number.isInteger(order) && order >= 0 ? order : 0,
            isDistractor: raw.isDistractor === true
          };
    }
    case "add_completion_blank": {
      const answer = boundedString(raw.answer, F);
      const position = Number(raw.position);
      return answer === null
        ? null
        : { type: "add_completion_blank", position: Number.isInteger(position) && position >= 0 ? position : 0, answer };
    }
    case "add_review_card": {
      const prompt = boundedString(raw.prompt, F);
      if (prompt === null) {
        return null;
      }
      const choices: LessonChoice[] = [];
      if (Array.isArray(raw.choices)) {
        raw.choices.slice(0, LESSON_LIMITS.maxChoices).forEach((rawChoice) => {
          if (!isRecord(rawChoice)) {
            return;
          }
          const text = boundedString(rawChoice.text, F);
          if (text !== null) {
            choices.push({ text, isCorrect: rawChoice.isCorrect === true });
          }
        });
      }
      const explanation = boundedString(raw.explanation, F);
      return { type: "add_review_card", prompt, choices, ...(explanation ? { explanation } : {}) };
    }
    default:
      return null;
  }
}

/** Parse a provider proposal (fenced JSON) into a bounded, id-tagged proposal. */
export function parseAuthoringProposal(text: unknown): ParseResult<AuthoringProposal> {
  if (typeof text !== "string") {
    return { ok: false, issues: [{ field: "proposal", message: "proposal must be text" }] };
  }
  const json = extractJson(text);
  if (!isRecord(json)) {
    return { ok: false, issues: [{ field: "proposal", message: "no JSON proposal found" }] };
  }
  const summary = boundedString(json.summary, LESSON_LIMITS.fieldMaxLength) ?? "";
  const rawOps = Array.isArray(json.operations) ? json.operations : [];
  const operations: IdentifiedOperation[] = [];
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
export function applyAcceptedOperations(payload: LessonPayload, operations: AuthoringOperation[]): LessonPayload {
  const next: LessonPayload = {
    ...payload,
    ...(payload.sections ? { sections: { ...payload.sections } } : {}),
    ...(payload.tags ? { tags: [...payload.tags] } : {}),
    ...(payload.learningObjectives ? { learningObjectives: [...payload.learningObjectives] } : {}),
    ...(payload.choices ? { choices: [...payload.choices] } : {}),
    ...(payload.parsonsBlocks ? { parsonsBlocks: [...payload.parsonsBlocks] } : {}),
    ...(payload.completionBlanks ? { completionBlanks: [...payload.completionBlanks] } : {})
  };

  for (const op of operations) {
    switch (op.type) {
      case "replace_field":
        if (op.field === "difficulty") {
          if (op.value === "beginner" || op.value === "intermediate" || op.value === "advanced") {
            next.difficulty = op.value;
          }
        } else {
          next[op.field] = op.value;
        }
        break;
      case "append_section": {
        const sections: LessonSections = { ...(next.sections ?? {}) };
        const existing = sections[op.section];
        sections[op.section] = existing && existing.length > 0 ? `${existing}\n\n${op.value}` : op.value;
        next.sections = sections;
        break;
      }
      case "set_objectives":
        next.learningObjectives = [...op.value];
        break;
      case "set_tags":
        next.tags = [...op.value];
        break;
      case "add_choice":
        next.choices = [...(next.choices ?? []), { text: op.text, isCorrect: op.isCorrect }];
        break;
      case "add_parsons_block":
        next.parsonsBlocks = [
          ...(next.parsonsBlocks ?? []),
          { text: op.text, correctOrder: op.correctOrder, isDistractor: op.isDistractor }
        ];
        break;
      case "add_completion_blank":
        next.completionBlanks = [...(next.completionBlanks ?? []), { position: op.position, answer: op.answer }];
        break;
      case "add_review_card":
        next.reviewCards = [
          ...(next.reviewCards ?? []),
          { prompt: op.prompt, choices: op.choices.map((c) => ({ ...c })), ...(op.explanation ? { explanation: op.explanation } : {}) }
        ];
        break;
      default:
        break;
    }
  }
  return next;
}

/** Non-blocking sanity issues for a proposal against the current payload. */
export function validateAuthoringProposal(proposal: AuthoringProposal): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (proposal.operations.length === 0) {
    issues.push({ field: "operations", message: "proposal has no operations" });
  }
  return issues;
}
