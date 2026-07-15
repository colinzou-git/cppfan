/*
 * Parsing and publication validation for user-created project labs (#489). Turns
 * untrusted editor/AI JSON into a bounded LabPayload, and reports the mode-/
 * evaluation-specific requirements that only matter at publish time. Pure and
 * I/O-free. Build/run settings are structured/allowlisted — raw shell commands
 * are rejected, never executed.
 */

import {
  CURRENT_LAB_SCHEMA_VERSION,
  EVALUATION_MODES,
  LAB_LIMITS,
  LAB_MODES,
  LAB_EDITABLE_FILENAME,
  type EvaluationMode,
  type ExerciseTest,
  type LabCompletionContract,
  type LabFixture,
  type LabMilestone,
  type LabMode,
  type LabPayload,
  type LabRunConfig
} from "./lab-content-types";
import type { ParseResult, ValidationIssue } from "./user-content-types";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const F = LAB_LIMITS.fieldMaxLength;

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

function parseTests(value: unknown, field: string, issues: ValidationIssue[]): ExerciseTest[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field, message: `${field} must be an array` });
    return undefined;
  }
  const out: ExerciseTest[] = [];
  value.slice(0, LAB_LIMITS.maxTests).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `${field}[${i}]`, message: "test must be an object" });
      return;
    }
    const name = optionalString(raw.name, `${field}[${i}].name`, LAB_LIMITS.titleMaxLength, issues) ?? `Test ${i + 1}`;
    const input = optionalString(raw.input, `${field}[${i}].input`, F, issues) ?? "";
    const expectedOutput = optionalString(raw.expectedOutput, `${field}[${i}].expectedOutput`, F, issues) ?? "";
    out.push({ name, input, expectedOutput, hidden: raw.hidden === true });
  });
  return out.length > 0 ? out : undefined;
}

function parseCompletion(value: unknown, field: string, issues: ValidationIssue[]): LabCompletionContract | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    issues.push({ field, message: `${field} must be an object` });
    return undefined;
  }
  const contract: LabCompletionContract = {};
  const tests = parseTests(value.tests, `${field}.tests`, issues);
  if (tests) contract.tests = tests;
  const aiRubric = optionalString(value.aiRubric, `${field}.aiRubric`, F, issues);
  if (aiRubric) contract.aiRubric = aiRubric;
  const selfChecklist = stringArray(value.selfChecklist, `${field}.selfChecklist`, LAB_LIMITS.maxChecklist, F, issues);
  if (selfChecklist) contract.selfChecklist = selfChecklist;
  const hints = stringArray(value.hints, `${field}.hints`, LAB_LIMITS.maxHints, F, issues);
  if (hints) contract.hints = hints;
  return contract;
}

function parseFixtures(value: unknown, issues: ValidationIssue[]): LabFixture[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field: "fixtures", message: "fixtures must be an array" });
    return undefined;
  }
  const out: LabFixture[] = [];
  const seen = new Set<string>();
  value.slice(0, LAB_LIMITS.maxFixtures).forEach((raw, i) => {
    if (!isRecord(raw)) return;
    const filename = optionalString(raw.filename, `fixtures[${i}].filename`, LAB_LIMITS.titleMaxLength, issues);
    if (!filename) {
      issues.push({ field: `fixtures[${i}].filename`, message: "a fixture filename is required" });
      return;
    }
    // No path traversal / absolute paths — fixtures mount flat and read-only.
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..") || filename === LAB_EDITABLE_FILENAME) {
      issues.push({ field: `fixtures[${i}].filename`, message: "invalid fixture filename" });
      return;
    }
    if (seen.has(filename)) {
      issues.push({ field: `fixtures[${i}].filename`, message: "duplicate fixture filename" });
      return;
    }
    seen.add(filename);
    const content = optionalString(raw.content, `fixtures[${i}].content`, F, issues) ?? "";
    out.push({ filename, content });
  });
  return out.length > 0 ? out : undefined;
}

const ALLOWED_LIBRARY_POLICIES = ["standard_only", "all"] as const;

function parseRunConfig(value: unknown, issues: ValidationIssue[]): LabRunConfig | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    issues.push({ field: "run", message: "run config must be an object" });
    return undefined;
  }
  // Raw shell commands are never accepted — the runner is allowlisted/structured.
  for (const forbidden of ["command", "buildCommand", "runCommand", "shell", "script"]) {
    if (value[forbidden] !== undefined) {
      issues.push({ field: `run.${forbidden}`, message: "raw build/run commands are not allowed; use structured settings" });
    }
  }
  const run: LabRunConfig = {};
  const cppStandard = optionalString(value.cppStandard, "run.cppStandard", 20, issues);
  if (cppStandard) run.cppStandard = cppStandard;
  if ((ALLOWED_LIBRARY_POLICIES as readonly string[]).includes(value.allowedLibraries as string)) {
    run.allowedLibraries = value.allowedLibraries as LabRunConfig["allowedLibraries"];
  }
  const runtime = boundedInt(value.runtimeLimitMs, LAB_LIMITS.maxRuntimeLimitMs);
  if (runtime) run.runtimeLimitMs = runtime;
  const memory = boundedInt(value.memoryLimitMb, LAB_LIMITS.maxMemoryLimitMb);
  if (memory) run.memoryLimitMb = memory;
  return Object.keys(run).length > 0 ? run : undefined;
}

function parseMilestones(value: unknown, issues: ValidationIssue[]): LabMilestone[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    issues.push({ field: "milestones", message: "milestones must be an array" });
    return undefined;
  }
  const out: LabMilestone[] = [];
  const seenIds = new Set<string>();
  value.slice(0, LAB_LIMITS.maxMilestones).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `milestones[${i}]`, message: "milestone must be an object" });
      return;
    }
    const title = requiredString(raw.title, `milestones[${i}].title`, LAB_LIMITS.titleMaxLength, issues);
    const instructions = requiredString(raw.instructions, `milestones[${i}].instructions`, F, issues);
    let id = optionalString(raw.id, `milestones[${i}].id`, 100, issues) ?? `m${i + 1}`;
    if (seenIds.has(id)) id = `${id}-${i + 1}`;
    seenIds.add(id);
    const contract = parseCompletion(raw, `milestones[${i}]`, issues) ?? {};
    out.push({
      id,
      title,
      instructions,
      ...(optionalString(raw.objective, `milestones[${i}].objective`, F, issues) ? { objective: (raw.objective as string).trim().slice(0, F) } : {}),
      ...(optionalString(raw.guidance, `milestones[${i}].guidance`, F, issues) ? { guidance: (raw.guidance as string).trim().slice(0, F) } : {}),
      ...(optionalString(raw.authorNotes, `milestones[${i}].authorNotes`, F, issues) ? { authorNotes: (raw.authorNotes as string).trim().slice(0, F) } : {}),
      required: raw.required !== false,
      ...contract
    });
  });
  return out;
}

/** Normalize untrusted editor/AI JSON into a bounded LabPayload. */
export function parseLabPayload(value: unknown): ParseResult<LabPayload> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [{ field: "payload", message: "payload must be an object" }] };
  }

  const schemaVersion = typeof value.schemaVersion === "number" ? value.schemaVersion : CURRENT_LAB_SCHEMA_VERSION;
  if (schemaVersion > CURRENT_LAB_SCHEMA_VERSION) {
    return { ok: false, issues: [{ field: "schemaVersion", message: "unsupported schema version" }] };
  }

  const title = requiredString(value.title, "title", LAB_LIMITS.titleMaxLength, issues);
  const summary = requiredString(value.summary, "summary", F, issues);
  const taskDescription = requiredString(value.taskDescription, "taskDescription", F, issues);

  const mode: LabMode = (LAB_MODES as readonly string[]).includes(value.mode as string)
    ? (value.mode as LabMode)
    : "single_task";
  const evaluationMode: EvaluationMode = (EVALUATION_MODES as readonly string[]).includes(value.evaluationMode as string)
    ? (value.evaluationMode as EvaluationMode)
    : "self_evaluation";

  const payload: LabPayload = { schemaVersion: CURRENT_LAB_SCHEMA_VERSION, title, summary, taskDescription, mode, evaluationMode };

  const groupId = optionalString(value.groupId, "groupId", LAB_LIMITS.titleMaxLength, issues);
  if (groupId) payload.groupId = groupId;
  const category = optionalString(value.category, "category", LAB_LIMITS.titleMaxLength, issues);
  if (category) payload.category = category;
  if ((DIFFICULTIES as readonly string[]).includes(value.difficulty as string)) {
    payload.difficulty = value.difficulty as LabPayload["difficulty"];
  }
  const minutes = boundedInt(value.estimatedMinutes, LAB_LIMITS.maxEstimatedMinutes);
  if (minutes) payload.estimatedMinutes = minutes;
  const tags = stringArray(value.tags, "tags", LAB_LIMITS.maxTags, LAB_LIMITS.tagMaxLength, issues);
  if (tags) payload.tags = tags;
  const objectives = stringArray(value.learningObjectives, "learningObjectives", LAB_LIMITS.maxObjectives, F, issues);
  if (objectives) payload.learningObjectives = objectives;
  const sourceNotes = optionalString(value.sourceNotes, "sourceNotes", F, issues);
  if (sourceNotes) payload.sourceNotes = sourceNotes;

  // One editable file, fixed to main.cpp in this phase.
  payload.editableFilename = LAB_EDITABLE_FILENAME;
  const starterCode = optionalString(value.starterCode, "starterCode", F, issues);
  if (starterCode) payload.starterCode = starterCode;
  const referenceSolution = optionalString(value.referenceSolution, "referenceSolution", F, issues);
  if (referenceSolution) payload.referenceSolution = referenceSolution;
  const solutionExplanation = optionalString(value.solutionExplanation, "solutionExplanation", F, issues);
  if (solutionExplanation) payload.solutionExplanation = solutionExplanation;

  const run = parseRunConfig(value.run, issues);
  if (run) payload.run = run;
  const fixtures = parseFixtures(value.fixtures, issues);
  if (fixtures) payload.fixtures = fixtures;

  const completion = parseCompletion(value.completion, "completion", issues);
  if (completion) payload.completion = completion;
  const milestones = parseMilestones(value.milestones, issues);
  if (milestones && milestones.length > 0) payload.milestones = milestones;

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, value: payload };
}

/**
 * Publication requirements that go beyond a well-formed payload. A milestone lab
 * needs ≥1 milestone; automated evaluation needs ≥1 test somewhere.
 */
export function validateLabForPublication(payload: LabPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (payload.mode === "milestones" && (!payload.milestones || payload.milestones.length === 0)) {
    issues.push({ field: "milestones", message: "a milestone lab needs at least one milestone" });
  }
  const automated = payload.evaluationMode === "automated_tests" || payload.evaluationMode === "automated_plus_ai";
  if (automated) {
    const hasTests =
      (payload.completion?.tests?.length ?? 0) > 0 ||
      (payload.milestones ?? []).some((m) => (m.tests?.length ?? 0) > 0);
    if (!hasTests) {
      issues.push({ field: "tests", message: "automated evaluation requires at least one test" });
    }
  }
  if (payload.mode === "milestones" && (payload.milestones ?? []).every((m) => !m.required)) {
    if ((payload.milestones ?? []).length > 0) {
      issues.push({ field: "milestones", message: "at least one milestone must be required" });
    }
  }
  return issues;
}
