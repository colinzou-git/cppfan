import type { CodeErrorTag } from "./code-error-tags";

/**
 * Error-pattern remediation types (#414). Turns deterministic Code Lab error tags
 * (#412) into one explainable, dismissible next-step suggestion. No mastery
 * rewrite, no opaque ML, no AI-generated items — just transparent rules.
 */

export type CodeRemediationAction =
  | "use_boundary_checklist"
  | "trace_with_ai"
  | "try_completion_item"
  | "try_parsons_item"
  | "review_related_skill"
  | "retry_code_lab";

export type CodeRemediationPriority = "low" | "medium" | "high";

export type CodeRemediationRule = {
  tag: CodeErrorTag;
  action: CodeRemediationAction;
  title: string;
  reason: string;
};

export type CodeRemediationRecommendation = {
  id: string;
  itemId: string;
  primaryTag: CodeErrorTag;
  relatedSkillIds: string[];
  action: CodeRemediationAction;
  title: string;
  reason: string;
  priority: CodeRemediationPriority;
  targetItemId?: string;
  checklistId?: string;
};

/** Minimal learning-item shape needed to pick a remediation target. */
export type LearningItemSummary = {
  id: string;
  type: string;
  skillIds: string[];
  title?: string;
};
