/*
 * User-created exercise payload types (#488, Phase 2). Mirrors the Phase 1
 * lesson foundation: a versioned, bounded payload for `kind = exercise` that the
 * shared user_content_items / user_content_versions tables and My Content
 * architecture (from #487) carry. Pure types + limits; no I/O.
 */

import type { LearningItemDifficulty } from "@/features/learning-items/learning-item-types";

export const CURRENT_EXERCISE_SCHEMA_VERSION = 1;

/** Program mode reads stdin/writes stdout; function mode declares a signature. */
export const CODE_CONTRACT_MODES = ["stdin_program", "function"] as const;
export type CodeContractMode = (typeof CODE_CONTRACT_MODES)[number];

/** Author-selected evaluation strategy. Automated modes require >=1 test. */
export const EVALUATION_MODES = ["automated_tests", "ai_evaluation", "self_evaluation", "automated_plus_ai"] as const;
export type EvaluationMode = (typeof EVALUATION_MODES)[number];

export const EXERCISE_LIMITS = {
  titleMaxLength: 200,
  fieldMaxLength: 20000,
  tagMaxLength: 40,
  maxTags: 20,
  maxObjectives: 20,
  maxExamples: 20,
  maxTests: 50,
  maxHints: 10,
  maxEdgeCases: 30,
  maxEstimatedMinutes: 600
} as const;

export type ExerciseExample = { input: string; output: string; note?: string };

/** A single automated test. `hidden` tests (and expectedOutput) stay server-side. */
export type ExerciseTest = { name: string; input: string; expectedOutput: string; hidden: boolean };

export type ExercisePayload = {
  schemaVersion: number;
  title: string;
  prompt: string;
  mode: CodeContractMode;
  evaluationMode: EvaluationMode;
  // Optional / common metadata
  groupId?: string;
  category?: string;
  difficulty?: LearningItemDifficulty;
  estimatedMinutes?: number;
  tags?: string[];
  learningObjectives?: string[];
  sourceNotes?: string;
  complexityTarget?: string;
  requiredEdgeCases?: string[];
  // Code contract
  cppStandard?: string;
  editableFilename?: string;
  starterCode?: string;
  sampleCode?: string;
  functionSignature?: string;
  harnessContract?: string;
  stdinFormat?: string;
  stdoutFormat?: string;
  referenceSolution?: string;
  solutionExplanation?: string;
  // Examples, tests, hints
  examples?: ExerciseExample[];
  tests?: ExerciseTest[];
  hints?: string[];
  edgeCaseChecklist?: string[];
};
