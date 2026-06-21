/**
 * Cross-context mastery coverage types (#417). A learner should not be marked
 * `mastered` from a single context (e.g. only recognition). These types describe
 * which evidence contexts a skill has, derived deterministically from the event
 * ledger. No ML; no automatic downgrade without an explanation.
 */

export type MasteryEvidenceContext =
  | "recognition"
  | "code_reading"
  | "bug_spotting"
  | "completion"
  | "parsons"
  | "code_lab"
  | "project_milestone"
  | "delayed_review";

export const MASTERY_EVIDENCE_CONTEXTS: readonly MasteryEvidenceContext[] = [
  "recognition",
  "code_reading",
  "bug_spotting",
  "completion",
  "parsons",
  "code_lab",
  "project_milestone",
  "delayed_review"
];

export type ContextEvidence = {
  count: number;
  recentSuccessCount: number;
  recentFailureCount: number;
  lastSeenAt?: string;
};

export type SkillContextCoverage = {
  skillId: string;
  contexts: Record<MasteryEvidenceContext, ContextEvidence>;
};

export type ContextCoverageRequirement = {
  skillIdPattern?: string;
  requiredForStrong: MasteryEvidenceContext[];
  requiredForMastered: MasteryEvidenceContext[];
};

/** Minimal event shape needed to derive coverage (a subset of SkillEvent). */
export type CoverageEvent = {
  event_type: string;
  event_time?: string;
  metadata?: Record<string, unknown> | null;
  skill_id?: string | null;
};
