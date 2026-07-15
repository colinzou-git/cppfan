/*
 * Parsing and publication validation for user-created exercises (#488). Turns
 * untrusted editor/AI JSON into a bounded ExercisePayload, and reports the
 * type-/evaluation-specific requirements that only matter at publish time.
 * Pure and I/O-free — safe to call anywhere and easy to test.
 */

import {
  CODE_CONTRACT_MODES,
  CURRENT_EXERCISE_SCHEMA_VERSION,
  EVALUATION_MODES,
  EXERCISE_LIMITS,
  type CodeContractMode,
  type EvaluationMode,
  type ExerciseExample,
  type ExercisePayload,
  type ExerciseTest
} from "./exercise-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string, max: number, issues: ValidationIssue[]): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ field, message: `${field} is required` });
    return "";
  }
  return value.trim().slice(0, max);
}

function optionalString(value: unknown, field: string, max: number, issues: ValidationIssue[]): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    issues.push({ field, message: `${field} must be text` });
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed.slice(0, max);
}

function stringArray(value: unknown, field: string, maxItems: number, maxLen: number, issues: ValidationIssue[]): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field, message: `${field} must be an array` });
    return undefined;
  }
  const out: string[] = [];
  value.slice(0, maxItems).forEach((raw) => {
    if (typeof raw === "string" && raw.trim().length > 0) {
      out.push(raw.trim().slice(0, maxLen));
    }
  });
  return out;
}

function parseExamples(value: unknown, issues: ValidationIssue[]): ExerciseExample[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "examples", message: "examples must be an array" });
    return undefined;
  }
  const F = EXERCISE_LIMITS.fieldMaxLength;
  const out: ExerciseExample[] = [];
  value.slice(0, EXERCISE_LIMITS.maxExamples).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `examples[${i}]`, message: "example must be an object" });
      return;
    }
    const input = optionalString(raw.input, `examples[${i}].input`, F, issues) ?? "";
    const output = optionalString(raw.output, `examples[${i}].output`, F, issues) ?? "";
    const note = optionalString(raw.note, `examples[${i}].note`, F, issues);
    out.push({ input, output, ...(note ? { note } : {}) });
  });
  return out;
}

function parseTests(value: unknown, issues: ValidationIssue[]): ExerciseTest[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "tests", message: "tests must be an array" });
    return undefined;
  }
  const F = EXERCISE_LIMITS.fieldMaxLength;
  const out: ExerciseTest[] = [];
  value.slice(0, EXERCISE_LIMITS.maxTests).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `tests[${i}]`, message: "test must be an object" });
      return;
    }
    const name = optionalString(raw.name, `tests[${i}].name`, EXERCISE_LIMITS.titleMaxLength, issues) ?? `Test ${i + 1}`;
    const input = optionalString(raw.input, `tests[${i}].input`, F, issues) ?? "";
    const expectedOutput = optionalString(raw.expectedOutput, `tests[${i}].expectedOutput`, F, issues) ?? "";
    out.push({ name, input, expectedOutput, hidden: raw.hidden === true });
  });
  return out;
}

/** Normalize untrusted editor/AI JSON into a bounded ExercisePayload. */
export function parseExercisePayload(value: unknown): ParseResult<ExercisePayload> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [{ field: "payload", message: "payload must be an object" }] };
  }

  const schemaVersion = typeof value.schemaVersion === "number" ? value.schemaVersion : CURRENT_EXERCISE_SCHEMA_VERSION;
  if (schemaVersion > CURRENT_EXERCISE_SCHEMA_VERSION) {
    return { ok: false, issues: [{ field: "schemaVersion", message: "unsupported schema version" }] };
  }

  const F = EXERCISE_LIMITS.fieldMaxLength;
  const title = requiredString(value.title, "title", EXERCISE_LIMITS.titleMaxLength, issues);
  const prompt = requiredString(value.prompt, "prompt", F, issues);

  const mode: CodeContractMode = (CODE_CONTRACT_MODES as readonly string[]).includes(value.mode as string)
    ? (value.mode as CodeContractMode)
    : "stdin_program";
  const evaluationMode: EvaluationMode = (EVALUATION_MODES as readonly string[]).includes(value.evaluationMode as string)
    ? (value.evaluationMode as EvaluationMode)
    : "self_evaluation";

  const payload: ExercisePayload = {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title,
    prompt,
    mode,
    evaluationMode
  };

  if (DIFFICULTIES.includes(value.difficulty as (typeof DIFFICULTIES)[number])) {
    payload.difficulty = value.difficulty as ExercisePayload["difficulty"];
  }
  const minutes = Number(value.estimatedMinutes);
  if (Number.isInteger(minutes) && minutes > 0 && minutes <= EXERCISE_LIMITS.maxEstimatedMinutes) {
    payload.estimatedMinutes = minutes;
  }

  const groupId = optionalString(value.groupId, "groupId", EXERCISE_LIMITS.titleMaxLength, issues);
  if (groupId) payload.groupId = groupId;
  const category = optionalString(value.category, "category", EXERCISE_LIMITS.titleMaxLength, issues);
  if (category) payload.category = category;
  const sourceNotes = optionalString(value.sourceNotes, "sourceNotes", F, issues);
  if (sourceNotes) payload.sourceNotes = sourceNotes;
  const complexityTarget = optionalString(value.complexityTarget, "complexityTarget", EXERCISE_LIMITS.titleMaxLength, issues);
  if (complexityTarget) payload.complexityTarget = complexityTarget;

  const tags = stringArray(value.tags, "tags", EXERCISE_LIMITS.maxTags, EXERCISE_LIMITS.tagMaxLength, issues);
  if (tags && tags.length > 0) payload.tags = tags;
  const objectives = stringArray(value.learningObjectives, "learningObjectives", EXERCISE_LIMITS.maxObjectives, F, issues);
  if (objectives && objectives.length > 0) payload.learningObjectives = objectives;
  const edgeCases = stringArray(value.requiredEdgeCases, "requiredEdgeCases", EXERCISE_LIMITS.maxEdgeCases, F, issues);
  if (edgeCases && edgeCases.length > 0) payload.requiredEdgeCases = edgeCases;
  const checklist = stringArray(value.edgeCaseChecklist, "edgeCaseChecklist", EXERCISE_LIMITS.maxEdgeCases, F, issues);
  if (checklist && checklist.length > 0) payload.edgeCaseChecklist = checklist;
  const hints = stringArray(value.hints, "hints", EXERCISE_LIMITS.maxHints, F, issues);
  if (hints && hints.length > 0) payload.hints = hints;

  const codeFields: Array<keyof ExercisePayload> = [
    "cppStandard",
    "editableFilename",
    "starterCode",
    "sampleCode",
    "functionSignature",
    "harnessContract",
    "stdinFormat",
    "stdoutFormat",
    "referenceSolution",
    "solutionExplanation"
  ];
  for (const field of codeFields) {
    const parsed = optionalString(value[field], field, F, issues);
    if (parsed) {
      (payload[field] as string) = parsed;
    }
  }

  if (value.starterIsBroken === true) {
    payload.starterIsBroken = true;
  }

  const examples = parseExamples(value.examples, issues);
  if (examples) payload.examples = examples;
  const tests = parseTests(value.tests, issues);
  if (tests) payload.tests = tests;

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, value: payload };
}

/**
 * Publication-time requirements beyond a parseable payload: title + prompt are
 * mandatory; automated evaluation needs at least one test; function mode needs a
 * signature. Compile/run validation of supplied code and tests happens
 * server-side and is not modeled here.
 */
export function validateExerciseForPublication(payload: ExercisePayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!payload.title || payload.title.trim().length === 0) {
    issues.push({ field: "title", message: "a title is required" });
  }
  if (!payload.prompt || payload.prompt.trim().length === 0) {
    issues.push({ field: "prompt", message: "an exercise prompt is required" });
  }
  if (payload.evaluationMode === "automated_tests" || payload.evaluationMode === "automated_plus_ai") {
    if (!payload.tests || payload.tests.length === 0) {
      issues.push({ field: "tests", message: "automated evaluation needs at least one test" });
    }
  }
  if (payload.mode === "function" && (!payload.functionSignature || payload.functionSignature.trim().length === 0)) {
    issues.push({ field: "functionSignature", message: "function mode needs a declared signature" });
  }
  return issues;
}
