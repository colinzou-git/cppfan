/*
 * User-created project-lab payload types (#489, Phase 3). Mirrors the Phase 2
 * exercise foundation: a versioned, bounded payload for `kind = lab` carried by
 * the shared user_content_items / user_content_versions tables and My Content
 * architecture (#487). A lab is one editable `main.cpp` plus either a single
 * completion contract or an ordered list of milestone checkpoints over one shared
 * codebase. Pure types + limits; no I/O. Answer-bearing fields (hidden tests,
 * reference solution, author notes, rubrics) never reach the client config.
 */

import type { LearningItemDifficulty } from "@/features/learning-items/learning-item-types";
import { EVALUATION_MODES, type EvaluationMode, type ExerciseTest } from "./exercise-content-types";

export const CURRENT_LAB_SCHEMA_VERSION = 1;

/** A lab is one substantial task, or a project of ordered milestone checkpoints. */
export const LAB_MODES = ["single_task", "milestones"] as const;
export type LabMode = (typeof LAB_MODES)[number];

export { EVALUATION_MODES };
export type { EvaluationMode, ExerciseTest };

export const LAB_LIMITS = {
  titleMaxLength: 200,
  fieldMaxLength: 20000,
  tagMaxLength: 40,
  maxTags: 20,
  maxObjectives: 20,
  maxTests: 50,
  maxHints: 10,
  maxMilestones: 30,
  maxFixtures: 20,
  maxChecklist: 30,
  maxEstimatedMinutes: 6000,
  maxRuntimeLimitMs: 60000,
  maxMemoryLimitMb: 2048
} as const;

/** A read-only fixture/input file mounted alongside main.cpp (never editable). */
export type LabFixture = { filename: string; content: string };

/** The completion contract shared by a single-task lab and each milestone. */
export type LabCompletionContract = {
  tests?: ExerciseTest[];
  aiRubric?: string;
  selfChecklist?: string[];
  hints?: string[];
};

/** One ordered checkpoint inside a multi-milestone lab. */
export type LabMilestone = LabCompletionContract & {
  id: string;
  title: string;
  instructions: string;
  objective?: string;
  guidance?: string;
  authorNotes?: string;
  required: boolean;
};

/**
 * The build/run configuration. Deliberately structured/allowlisted — authors
 * never supply raw shell commands (rejected at parse). `allowedLibraries` is a
 * policy label, not an executable command.
 */
export type LabRunConfig = {
  cppStandard?: string;
  allowedLibraries?: "standard_only" | "all";
  runtimeLimitMs?: number;
  memoryLimitMb?: number;
};

export type LabPayload = {
  schemaVersion: number;
  title: string;
  summary: string;
  taskDescription: string;
  mode: LabMode;
  evaluationMode: EvaluationMode;
  // Optional / common metadata
  groupId?: string;
  category?: string;
  difficulty?: LearningItemDifficulty;
  estimatedMinutes?: number;
  tags?: string[];
  learningObjectives?: string[];
  sourceNotes?: string;
  // Shared workspace (one editable main.cpp)
  editableFilename?: string; // fixed to main.cpp in this phase
  starterCode?: string;
  referenceSolution?: string;
  solutionExplanation?: string;
  run?: LabRunConfig;
  fixtures?: LabFixture[];
  // Single-task completion contract (mode = single_task)
  completion?: LabCompletionContract;
  // Milestone checkpoints (mode = milestones)
  milestones?: LabMilestone[];
};

export const LAB_EDITABLE_FILENAME = "main.cpp";
