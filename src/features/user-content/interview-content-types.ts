/*
 * User-created interview-problem payload types (#490, Phase 4). Mirrors the
 * Phase 2/3 foundation: a versioned, bounded payload for
 * `kind = interview_problem` carried by the shared user_content_items /
 * user_content_versions tables and My Content architecture (#487). Reuses the
 * native interview vocabularies (group, role relevance) and the shared
 * ExerciseTest shape. Answer-bearing fields (hidden tests, reference solution,
 * rubric, author notes) never reach the learner-facing projection. Pure types +
 * limits; no I/O.
 */

import type { ProblemGroup, RoleRelevance, VisibleExample } from "@/features/interview/problem-catalog";
import type { ExerciseTest } from "./exercise-content-types";

export const CURRENT_INTERVIEW_SCHEMA_VERSION = 1;

export type { ProblemGroup, RoleRelevance, VisibleExample, ExerciseTest };

/** Interview difficulty vocabulary (matches the native catalog). */
export const INTERVIEW_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

/**
 * Author-selected evaluation strategy. `judge`/`judge_plus_ai` need >=1 test;
 * `judge_plus_ai` also needs an AI rubric; `ai_evaluation`/`self_evaluation` may
 * publish without automated tests.
 */
export const INTERVIEW_EVALUATION_MODES = ["judge", "judge_plus_ai", "ai_evaluation", "self_evaluation"] as const;
export type InterviewEvaluationMode = (typeof INTERVIEW_EVALUATION_MODES)[number];

export const INTERVIEW_LIMITS = {
  titleMaxLength: 200,
  fieldMaxLength: 20000,
  tagMaxLength: 40,
  maxTags: 20,
  maxSecondaryLabels: 20,
  maxExamples: 20,
  maxTests: 50,
  maxHints: 12,
  maxEdgeCases: 30,
  maxClarifyingQuestions: 20,
  maxEstimatedMinutes: 600
} as const;

export type InterviewProblemPayload = {
  schemaVersion: number;
  title: string;
  statement: string;
  evaluationMode: InterviewEvaluationMode;
  // Optional metadata
  group?: ProblemGroup;
  roleRelevance?: RoleRelevance;
  difficulty?: InterviewDifficulty;
  primaryLabel?: string;
  secondaryLabels?: string[];
  patternTags?: string[];
  tags?: string[];
  constraints?: string;
  targetComplexity?: string;
  requiredEdgeCases?: string[];
  clarifyingQuestions?: string[];
  estimatedMinutes?: number;
  // Progressive hints (least to most revealing) + visible examples
  hintLadder?: string[];
  visibleExamples?: VisibleExample[];
  // Code contract
  editableFilename?: string;
  starterCode?: string;
  referenceSolution?: string;
  solutionExplanation?: string;
  // Tests + AI rubric
  tests?: ExerciseTest[];
  aiRubric?: string;
};

export const INTERVIEW_EDITABLE_FILENAME = "main.cpp";
