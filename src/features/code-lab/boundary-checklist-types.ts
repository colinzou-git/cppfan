import type { CodeErrorTag } from "./code-error-tags";

/**
 * Boundary-case checklist types (#411). A lightweight, AI-free learning aid: a
 * curated list of edge cases a learner should test for a given skill/pattern.
 * Checklist items are strategy hints, never grading criteria, and this feature
 * does not touch mastery scoring.
 */

export type BoundaryChecklistItem = {
  id: string;
  label: string;
  explanation?: string;
  /** Optional sample stdin the learner can drop into the Code Lab. */
  sampleInput?: string;
  expectedBehavior?: string;
  /** Error tags this edge case commonly surfaces (links to #410's schema). */
  relatedErrorTags?: CodeErrorTag[];
};

export type BoundaryChecklist = {
  id: string;
  title: string;
  /** Skill ids this checklist applies to; used for skill-driven resolution. */
  skillIds: string[];
  items: BoundaryChecklistItem[];
};

/** Per-mount checked state: checklistId -> itemId -> checked. */
export type BoundaryChecklistState = Record<string, Record<string, boolean>>;
