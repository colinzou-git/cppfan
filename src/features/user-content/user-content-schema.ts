/*
 * Pure validation/normalization for the lesson authoring payload (#487).
 *
 * `parseLessonPayload` turns untrusted editor/AI JSON into a bounded, normalized
 * LessonPayload (or a list of issues). `validateLessonForPublication` adds the
 * type-specific requirements that only matter when publishing a graded item.
 * No I/O, no server/browser imports — safe to call anywhere and easy to test.
 */

import {
  CURRENT_LESSON_SCHEMA_VERSION,
  LESSON_LIMITS,
  type LessonChoice,
  type LessonCompletionBlank,
  type LessonExample,
  type LessonParsonsBlock,
  type LessonPayload,
  type LessonReviewCard,
  type LessonSections,
  type ParseResult,
  type ValidationIssue
} from "./user-content-types";

const LEARNING_ITEM_TYPES = [
  "lesson",
  "concept_check",
  "multiple_choice",
  "code_reading",
  "bug_spotting",
  "parsons",
  "worked_example",
  "completion"
] as const;

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const SECTION_KEYS: (keyof LessonSections)[] = [
  "introduction",
  "syntax",
  "examples",
  "commonMistakes",
  "bestPractices",
  "practice",
  "summary",
  "furtherReading"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  value: unknown,
  field: string,
  maxLength: number,
  issues: ValidationIssue[]
): string {
  if (typeof value !== "string") {
    issues.push({ field, message: `${field} is required` });
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    issues.push({ field, message: `${field} must not be empty` });
    return "";
  }
  if (trimmed.length > maxLength) {
    issues.push({ field, message: `${field} must be at most ${maxLength} characters` });
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}

function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
  issues: ValidationIssue[]
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    issues.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  if (value.length > maxLength) {
    issues.push({ field, message: `${field} must be at most ${maxLength} characters` });
    return value.slice(0, maxLength);
  }
  return value;
}

function stringArray(
  value: unknown,
  field: string,
  maxItems: number,
  itemMaxLength: number,
  issues: ValidationIssue[]
): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field, message: `${field} must be an array` });
    return undefined;
  }
  const out: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") {
      issues.push({ field, message: `${field} must contain only strings` });
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      continue;
    }
    out.push(trimmed.slice(0, itemMaxLength));
    if (out.length >= maxItems) {
      break;
    }
  }
  return out;
}

function parseSections(value: unknown, issues: ValidationIssue[]): LessonSections | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!isRecord(value)) {
    issues.push({ field: "sections", message: "sections must be an object" });
    return undefined;
  }
  const sections: LessonSections = {};
  for (const key of SECTION_KEYS) {
    const parsed = optionalString(value[key], `sections.${key}`, LESSON_LIMITS.fieldMaxLength, issues);
    if (parsed !== undefined) {
      sections[key] = parsed;
    }
  }
  return Object.keys(sections).length > 0 ? sections : undefined;
}

function parseExamples(value: unknown, issues: ValidationIssue[]): LessonExample[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "examples", message: "examples must be an array" });
    return undefined;
  }
  const out: LessonExample[] = [];
  value.slice(0, LESSON_LIMITS.maxExamples).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `examples[${i}]`, message: "example must be an object" });
      return;
    }
    const input = optionalString(raw.input, `examples[${i}].input`, LESSON_LIMITS.fieldMaxLength, issues) ?? "";
    const output = optionalString(raw.output, `examples[${i}].output`, LESSON_LIMITS.fieldMaxLength, issues) ?? "";
    const note = optionalString(raw.note, `examples[${i}].note`, LESSON_LIMITS.fieldMaxLength, issues);
    out.push(note === undefined ? { input, output } : { input, output, note });
  });
  return out;
}

function parseChoices(value: unknown, issues: ValidationIssue[]): LessonChoice[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "choices", message: "choices must be an array" });
    return undefined;
  }
  const out: LessonChoice[] = [];
  value.slice(0, LESSON_LIMITS.maxChoices).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `choices[${i}]`, message: "choice must be an object" });
      return;
    }
    const text = requiredString(raw.text, `choices[${i}].text`, LESSON_LIMITS.fieldMaxLength, issues);
    out.push({ text, isCorrect: raw.isCorrect === true });
  });
  return out;
}

function parseReviewCards(value: unknown, issues: ValidationIssue[]): LessonReviewCard[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "reviewCards", message: "reviewCards must be an array" });
    return undefined;
  }
  const out: LessonReviewCard[] = [];
  value.slice(0, LESSON_LIMITS.maxReviewCards).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `reviewCards[${i}]`, message: "review card must be an object" });
      return;
    }
    const prompt = requiredString(raw.prompt, `reviewCards[${i}].prompt`, LESSON_LIMITS.fieldMaxLength, issues);
    const choices: LessonChoice[] = [];
    if (Array.isArray(raw.choices)) {
      raw.choices.slice(0, LESSON_LIMITS.maxChoices).forEach((rawChoice, j) => {
        if (!isRecord(rawChoice)) {
          issues.push({ field: `reviewCards[${i}].choices[${j}]`, message: "choice must be an object" });
          return;
        }
        const text = requiredString(rawChoice.text, `reviewCards[${i}].choices[${j}].text`, LESSON_LIMITS.fieldMaxLength, issues);
        choices.push({ text, isCorrect: rawChoice.isCorrect === true });
      });
    }
    const explanation = optionalString(raw.explanation, `reviewCards[${i}].explanation`, LESSON_LIMITS.fieldMaxLength, issues);
    out.push({ prompt, choices, ...(explanation ? { explanation } : {}) });
  });
  return out;
}

function parseParsonsBlocks(value: unknown, issues: ValidationIssue[]): LessonParsonsBlock[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "parsonsBlocks", message: "parsonsBlocks must be an array" });
    return undefined;
  }
  const out: LessonParsonsBlock[] = [];
  value.slice(0, LESSON_LIMITS.maxParsonsBlocks).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `parsonsBlocks[${i}]`, message: "block must be an object" });
      return;
    }
    const text = requiredString(raw.text, `parsonsBlocks[${i}].text`, LESSON_LIMITS.fieldMaxLength, issues);
    const order = Number(raw.correctOrder);
    out.push({
      text,
      correctOrder: Number.isInteger(order) && order >= 0 ? order : 0,
      isDistractor: raw.isDistractor === true
    });
  });
  return out;
}

function parseCompletionBlanks(value: unknown, issues: ValidationIssue[]): LessonCompletionBlank[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({ field: "completionBlanks", message: "completionBlanks must be an array" });
    return undefined;
  }
  const out: LessonCompletionBlank[] = [];
  value.slice(0, LESSON_LIMITS.maxCompletionBlanks).forEach((raw, i) => {
    if (!isRecord(raw)) {
      issues.push({ field: `completionBlanks[${i}]`, message: "blank must be an object" });
      return;
    }
    const position = Number(raw.position);
    const answer = optionalString(raw.answer, `completionBlanks[${i}].answer`, LESSON_LIMITS.fieldMaxLength, issues) ?? "";
    out.push({ position: Number.isInteger(position) && position >= 0 ? position : i, answer });
  });
  return out;
}

/** Normalize untrusted lesson JSON into a bounded LessonPayload. */
export function parseLessonPayload(value: unknown): ParseResult<LessonPayload> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [{ field: "payload", message: "payload must be an object" }] };
  }

  const itemTypeRaw = value.itemType;
  if (typeof itemTypeRaw !== "string" || !(LEARNING_ITEM_TYPES as readonly string[]).includes(itemTypeRaw)) {
    issues.push({ field: "itemType", message: "itemType is not a valid learning-item type" });
  }

  let schemaVersion = CURRENT_LESSON_SCHEMA_VERSION;
  if (value.schemaVersion !== undefined) {
    const v = Number(value.schemaVersion);
    if (!Number.isInteger(v) || v < 1) {
      issues.push({ field: "schemaVersion", message: "schemaVersion must be a positive integer" });
    } else if (v > CURRENT_LESSON_SCHEMA_VERSION) {
      issues.push({ field: "schemaVersion", message: `schemaVersion ${v} is newer than supported (${CURRENT_LESSON_SCHEMA_VERSION})` });
    } else {
      schemaVersion = v;
    }
  }

  const title = requiredString(value.title, "title", LESSON_LIMITS.titleMaxLength, issues);
  const content = requiredString(value.content, "content", LESSON_LIMITS.contentMaxLength, issues);
  const explanation = requiredString(value.explanation, "explanation", LESSON_LIMITS.explanationMaxLength, issues);

  let difficulty: LessonPayload["difficulty"];
  if (value.difficulty !== undefined && value.difficulty !== null) {
    if (typeof value.difficulty === "string" && (DIFFICULTIES as readonly string[]).includes(value.difficulty)) {
      difficulty = value.difficulty as LessonPayload["difficulty"];
    } else {
      issues.push({ field: "difficulty", message: "difficulty must be beginner, intermediate, or advanced" });
    }
  }

  let estimatedMinutes: number | undefined;
  if (value.estimatedMinutes !== undefined && value.estimatedMinutes !== null) {
    const m = Number(value.estimatedMinutes);
    if (!Number.isInteger(m) || m < 1 || m > LESSON_LIMITS.maxEstimatedMinutes) {
      issues.push({ field: "estimatedMinutes", message: `estimatedMinutes must be 1..${LESSON_LIMITS.maxEstimatedMinutes}` });
    } else {
      estimatedMinutes = m;
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const payload: LessonPayload = {
    schemaVersion,
    itemType: itemTypeRaw as LessonPayload["itemType"],
    title,
    content,
    explanation
  };
  if (difficulty !== undefined) payload.difficulty = difficulty;
  if (estimatedMinutes !== undefined) payload.estimatedMinutes = estimatedMinutes;

  const tags = stringArray(value.tags, "tags", LESSON_LIMITS.maxTags, LESSON_LIMITS.tagMaxLength, issues);
  if (tags && tags.length > 0) payload.tags = tags;
  const objectives = stringArray(value.learningObjectives, "learningObjectives", LESSON_LIMITS.maxObjectives, LESSON_LIMITS.fieldMaxLength, issues);
  if (objectives && objectives.length > 0) payload.learningObjectives = objectives;

  const sourceNotes = optionalString(value.sourceNotes, "sourceNotes", LESSON_LIMITS.fieldMaxLength, issues);
  if (sourceNotes !== undefined) payload.sourceNotes = sourceNotes;

  const sections = parseSections(value.sections, issues);
  if (sections) payload.sections = sections;
  const examples = parseExamples(value.examples, issues);
  if (examples && examples.length > 0) payload.examples = examples;

  for (const codeField of ["sampleCode", "starterCode", "referenceSolution", "expectedOutput", "solutionExplanation"] as const) {
    const parsed = optionalString(value[codeField], codeField, LESSON_LIMITS.fieldMaxLength, issues);
    if (parsed !== undefined) payload[codeField] = parsed;
  }

  const choices = parseChoices(value.choices, issues);
  if (choices) payload.choices = choices;
  const parsonsBlocks = parseParsonsBlocks(value.parsonsBlocks, issues);
  if (parsonsBlocks) payload.parsonsBlocks = parsonsBlocks;
  const completionBlanks = parseCompletionBlanks(value.completionBlanks, issues);
  if (completionBlanks) payload.completionBlanks = completionBlanks;
  const reviewCards = parseReviewCards(value.reviewCards, issues);
  if (reviewCards) payload.reviewCards = reviewCards;

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, value: payload };
}

/**
 * Type-specific publication requirements. Returns the issues that block
 * publishing; an empty array means the lesson is publishable.
 */
export function validateLessonForPublication(payload: LessonPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (payload.title.trim().length === 0) {
    issues.push({ field: "title", message: "title is required to publish" });
  }
  if (payload.content.trim().length === 0) {
    issues.push({ field: "content", message: "content is required to publish" });
  }
  if (payload.explanation.trim().length === 0) {
    issues.push({ field: "explanation", message: "explanation is required to publish" });
  }

  switch (payload.itemType) {
    case "multiple_choice": {
      const choices = payload.choices ?? [];
      if (choices.length < 2) {
        issues.push({ field: "choices", message: "multiple choice needs at least two choices" });
      }
      if (!choices.some((c) => c.isCorrect)) {
        issues.push({ field: "choices", message: "multiple choice needs at least one correct choice" });
      }
      break;
    }
    case "parsons": {
      const blocks = payload.parsonsBlocks ?? [];
      const solutionBlocks = blocks.filter((b) => !b.isDistractor);
      if (solutionBlocks.length < 2) {
        issues.push({ field: "parsonsBlocks", message: "parsons needs at least two solution blocks" });
      }
      break;
    }
    case "completion": {
      const blanks = payload.completionBlanks ?? [];
      if (blanks.length < 1) {
        issues.push({ field: "completionBlanks", message: "completion needs at least one blank" });
      }
      if (blanks.some((b) => b.answer.trim().length === 0)) {
        issues.push({ field: "completionBlanks", message: "every completion blank needs an answer" });
      }
      break;
    }
    default:
      break;
  }
  return issues;
}
