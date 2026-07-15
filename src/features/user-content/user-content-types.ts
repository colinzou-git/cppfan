/*
 * Shared types for private user-created content (#487 Phase 1 foundation).
 *
 * This module is pure data/type definitions with no server- or browser-only
 * imports, so it can be used from client UI, server actions, and tests alike.
 * The lesson payload mirrors the structured authoring fields described in #487;
 * answer-bearing fields (choice.isCorrect, parsons ordering, completion answers)
 * live here for the OWNER/authoring side only and must never be included in a
 * pre-answer learner payload — see docs/USER_CONTENT.md.
 */

import type {
  LearningItemDifficulty,
  LearningItemType
} from "@/features/learning-items/learning-item-types";

/** The four kinds of user-created content. Phase 1 only exposes `lesson`. */
export const USER_CONTENT_KINDS = ["lesson", "exercise", "lab", "interview_problem"] as const;
export type UserContentKind = (typeof USER_CONTENT_KINDS)[number];

export function isUserContentKind(value: string): value is UserContentKind {
  return (USER_CONTENT_KINDS as readonly string[]).includes(value);
}

/** Draft/published/archived lifecycle for a content item. */
export const USER_CONTENT_LIFECYCLES = ["draft", "published", "archived"] as const;
export type UserContentLifecycle = (typeof USER_CONTENT_LIFECYCLES)[number];

export function isUserContentLifecycle(value: string): value is UserContentLifecycle {
  return (USER_CONTENT_LIFECYCLES as readonly string[]).includes(value);
}

/** Whether an item comes from the native seed curriculum or a user. */
export type ContentSource = "native" | "user";

/** Exact visible source labels used everywhere native and custom items mix. */
export const SOURCE_LABELS = {
  native: "Native cppFan",
  user: "User-Created"
} as const;
export type SourceLabel = (typeof SOURCE_LABELS)[ContentSource];

export function sourceLabel(source: ContentSource): SourceLabel {
  return SOURCE_LABELS[source];
}

/** Per-attachment visibility. Author-source is hidden from learner pages. */
export const ATTACHMENT_VISIBILITIES = ["author_source", "learner_resource"] as const;
export type AttachmentVisibility = (typeof ATTACHMENT_VISIBILITIES)[number];

/** Current lesson payload schema version. Bump when the shape changes. */
export const CURRENT_LESSON_SCHEMA_VERSION = 1;

/** Bounds used by the schema parser to keep payloads sane. */
export const LESSON_LIMITS = {
  titleMaxLength: 200,
  contentMaxLength: 20000,
  explanationMaxLength: 20000,
  fieldMaxLength: 20000,
  tagMaxLength: 40,
  maxTags: 20,
  maxObjectives: 20,
  maxExamples: 20,
  maxChoices: 12,
  maxParsonsBlocks: 40,
  maxCompletionBlanks: 20,
  maxReviewCards: 20,
  maxEstimatedMinutes: 600
} as const;

export type LessonChoice = { text: string; isCorrect: boolean };
export type LessonParsonsBlock = { text: string; correctOrder: number; isDistractor: boolean };
export type LessonCompletionBlank = { position: number; answer: string };
export type LessonExample = { input: string; output: string; note?: string };
/** A supplementary review question. On publish each becomes an independent
 * multiple-choice FSRS card mapped to the lesson's owner skill. */
export type LessonReviewCard = { prompt: string; choices: LessonChoice[]; explanation?: string };

/** Optional structured teaching sections (all Markdown). */
export type LessonSections = {
  introduction?: string;
  syntax?: string;
  examples?: string;
  commonMistakes?: string;
  bestPractices?: string;
  practice?: string;
  summary?: string;
  furtherReading?: string;
};

/**
 * The structured lesson authoring payload. Only `title`, `content`, and
 * `explanation` are mandatory to save; interactive types add requirements at
 * publish time (see validateLessonForPublication).
 */
export type LessonPayload = {
  schemaVersion: number;
  itemType: LearningItemType;
  title: string;
  content: string;
  explanation: string;
  difficulty?: LearningItemDifficulty;
  estimatedMinutes?: number;
  tags?: string[];
  learningObjectives?: string[];
  sourceNotes?: string;
  sections?: LessonSections;
  examples?: LessonExample[];
  sampleCode?: string;
  starterCode?: string;
  referenceSolution?: string;
  expectedOutput?: string;
  solutionExplanation?: string;
  choices?: LessonChoice[];
  parsonsBlocks?: LessonParsonsBlock[];
  completionBlanks?: LessonCompletionBlank[];
  reviewCards?: LessonReviewCard[];
};

export type ValidationIssue = { field: string; message: string };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };
