/*
 * Parsing and publication validation for user-created interview problems (#490).
 * Turns untrusted editor/AI JSON into a bounded InterviewProblemPayload, and
 * reports the evaluation-mode requirements that only matter at publish time.
 * Pure and I/O-free.
 */

import {
  CURRENT_INTERVIEW_SCHEMA_VERSION,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_EVALUATION_MODES,
  INTERVIEW_LIMITS,
  INTERVIEW_EDITABLE_FILENAME,
  type InterviewDifficulty,
  type InterviewEvaluationMode,
  type InterviewProblemPayload,
  type ExerciseTest,
  type VisibleExample
} from "./interview-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

// Runtime copies of the native vocabularies (the catalog exports them as types
// only). Kept here so validation never imports the native catalog data.
const PROBLEM_GROUPS = [
  "arrays_hashing_prefix",
  "two_pointers_sliding_window",
  "binary_search",
  "intervals_sweepline",
  "stacks_queues_monotonic",
  "heaps_topk_streaming",
  "linked_cache",
  "trees_bst",
  "graphs_paths",
  "union_find",
  "dp_backtracking",
  "cpp_implementation"
] as const;
const ROLE_RELEVANCE = ["general", "systems", "storage", "streaming", "concurrency-adjacent"] as const;

const F = INTERVIEW_LIMITS.fieldMaxLength;

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
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    issues.push({ field, message: `${field} must be text` });
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed.slice(0, max);
}

function stringArray(value: unknown, field: string, maxItems: number, maxLen: number, issues: ValidationIssue[]): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field, message: `${field} must be an array` });
    return undefined;
  }
  const out: string[] = [];
  value.slice(0, maxItems).forEach((raw) => {
    if (typeof raw === "string" && raw.trim().length > 0) out.push(raw.trim().slice(0, maxLen));
  });
  return out.length > 0 ? out : undefined;
}

function boundedInt(value: unknown, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const n = Math.floor(value);
  if (n <= 0) return undefined;
  return Math.min(n, max);
}

function parseExamples(value: unknown, issues: ValidationIssue[]): VisibleExample[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field: "visibleExamples", message: "visibleExamples must be an array" });
    return undefined;
  }
  const out: VisibleExample[] = [];
  value.slice(0, INTERVIEW_LIMITS.maxExamples).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `visibleExamples[${i}]`, message: "example must be an object" });
      return;
    }
    const input = optionalString(raw.input, `visibleExamples[${i}].input`, F, issues) ?? "";
    const output = optionalString(raw.output, `visibleExamples[${i}].output`, F, issues) ?? "";
    const note = optionalString(raw.note, `visibleExamples[${i}].note`, F, issues);
    out.push({ input, output, ...(note ? { note } : {}) });
  });
  return out.length > 0 ? out : undefined;
}

function parseTests(value: unknown, issues: ValidationIssue[]): ExerciseTest[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field: "tests", message: "tests must be an array" });
    return undefined;
  }
  const out: ExerciseTest[] = [];
  value.slice(0, INTERVIEW_LIMITS.maxTests).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `tests[${i}]`, message: "test must be an object" });
      return;
    }
    const name = optionalString(raw.name, `tests[${i}].name`, INTERVIEW_LIMITS.titleMaxLength, issues) ?? `Test ${i + 1}`;
    const input = optionalString(raw.input, `tests[${i}].input`, F, issues) ?? "";
    const expectedOutput = optionalString(raw.expectedOutput, `tests[${i}].expectedOutput`, F, issues) ?? "";
    out.push({ name, input, expectedOutput, hidden: raw.hidden === true });
  });
  return out.length > 0 ? out : undefined;
}

/** Normalize untrusted editor/AI JSON into a bounded InterviewProblemPayload. */
export function parseInterviewPayload(value: unknown): ParseResult<InterviewProblemPayload> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [{ field: "payload", message: "payload must be an object" }] };
  }

  const schemaVersion = typeof value.schemaVersion === "number" ? value.schemaVersion : CURRENT_INTERVIEW_SCHEMA_VERSION;
  if (schemaVersion > CURRENT_INTERVIEW_SCHEMA_VERSION) {
    return { ok: false, issues: [{ field: "schemaVersion", message: "unsupported schema version" }] };
  }

  const title = requiredString(value.title, "title", INTERVIEW_LIMITS.titleMaxLength, issues);
  const statement = requiredString(value.statement, "statement", F, issues);
  const evaluationMode: InterviewEvaluationMode = (INTERVIEW_EVALUATION_MODES as readonly string[]).includes(value.evaluationMode as string)
    ? (value.evaluationMode as InterviewEvaluationMode)
    : "self_evaluation";

  const payload: InterviewProblemPayload = {
    schemaVersion: CURRENT_INTERVIEW_SCHEMA_VERSION,
    title,
    statement,
    evaluationMode
  };

  if ((PROBLEM_GROUPS as readonly string[]).includes(value.group as string)) {
    payload.group = value.group as InterviewProblemPayload["group"];
  }
  if ((ROLE_RELEVANCE as readonly string[]).includes(value.roleRelevance as string)) {
    payload.roleRelevance = value.roleRelevance as InterviewProblemPayload["roleRelevance"];
  }
  if ((INTERVIEW_DIFFICULTIES as readonly string[]).includes(value.difficulty as string)) {
    payload.difficulty = value.difficulty as InterviewDifficulty;
  }
  const primaryLabel = optionalString(value.primaryLabel, "primaryLabel", INTERVIEW_LIMITS.titleMaxLength, issues);
  if (primaryLabel) payload.primaryLabel = primaryLabel;
  const secondaryLabels = stringArray(value.secondaryLabels, "secondaryLabels", INTERVIEW_LIMITS.maxSecondaryLabels, INTERVIEW_LIMITS.titleMaxLength, issues);
  if (secondaryLabels) payload.secondaryLabels = secondaryLabels;
  const patternTags = stringArray(value.patternTags, "patternTags", INTERVIEW_LIMITS.maxTags, INTERVIEW_LIMITS.tagMaxLength, issues);
  if (patternTags) payload.patternTags = patternTags;
  const tags = stringArray(value.tags, "tags", INTERVIEW_LIMITS.maxTags, INTERVIEW_LIMITS.tagMaxLength, issues);
  if (tags) payload.tags = tags;
  const constraints = optionalString(value.constraints, "constraints", F, issues);
  if (constraints) payload.constraints = constraints;
  const targetComplexity = optionalString(value.targetComplexity, "targetComplexity", F, issues);
  if (targetComplexity) payload.targetComplexity = targetComplexity;
  const edgeCases = stringArray(value.requiredEdgeCases, "requiredEdgeCases", INTERVIEW_LIMITS.maxEdgeCases, F, issues);
  if (edgeCases) payload.requiredEdgeCases = edgeCases;
  const clarifying = stringArray(value.clarifyingQuestions, "clarifyingQuestions", INTERVIEW_LIMITS.maxClarifyingQuestions, F, issues);
  if (clarifying) payload.clarifyingQuestions = clarifying;
  const minutes = boundedInt(value.estimatedMinutes, INTERVIEW_LIMITS.maxEstimatedMinutes);
  if (minutes) payload.estimatedMinutes = minutes;
  const hintLadder = stringArray(value.hintLadder, "hintLadder", INTERVIEW_LIMITS.maxHints, F, issues);
  if (hintLadder) payload.hintLadder = hintLadder;

  const examples = parseExamples(value.visibleExamples, issues);
  if (examples) payload.visibleExamples = examples;

  payload.editableFilename = INTERVIEW_EDITABLE_FILENAME;
  const starterCode = optionalString(value.starterCode, "starterCode", F, issues);
  if (starterCode) payload.starterCode = starterCode;
  const referenceSolution = optionalString(value.referenceSolution, "referenceSolution", F, issues);
  if (referenceSolution) payload.referenceSolution = referenceSolution;
  const solutionExplanation = optionalString(value.solutionExplanation, "solutionExplanation", F, issues);
  if (solutionExplanation) payload.solutionExplanation = solutionExplanation;

  const tests = parseTests(value.tests, issues);
  if (tests) payload.tests = tests;
  const aiRubric = optionalString(value.aiRubric, "aiRubric", F, issues);
  if (aiRubric) payload.aiRubric = aiRubric;

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, value: payload };
}

/**
 * Publication requirements beyond a well-formed payload, per the evaluation
 * mode. judge/judge_plus_ai need >=1 test; judge_plus_ai also needs a rubric.
 */
export function validateInterviewForPublication(payload: InterviewProblemPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const needsTests = payload.evaluationMode === "judge" || payload.evaluationMode === "judge_plus_ai";
  if (needsTests && (payload.tests?.length ?? 0) === 0) {
    issues.push({ field: "tests", message: "judge evaluation requires at least one test" });
  }
  if (payload.evaluationMode === "judge_plus_ai" && !payload.aiRubric?.trim()) {
    issues.push({ field: "aiRubric", message: "judge + AI evaluation requires an AI rubric" });
  }
  return issues;
}
