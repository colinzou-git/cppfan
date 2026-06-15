// Type declarations for the dependency-free closure-guard logic (#147), shared by
// the GitHub Action wrapper and the Vitest regression suite.

export const REMAINING_WORK_PATTERNS: RegExp[];
export const FINAL_AUDIT_MARKER: RegExp;
export const COMPLETION_TITLE_PATTERNS: RegExp[];

export function hasUncheckedBoxes(text?: string): boolean;
export function checkboxCount(text?: string): number;
export function mentionsRemainingWork(text?: string): boolean;
export function hasFinalAudit(comments?: string[]): boolean;

export type IssueLabel = string | { name?: string };

export function isCompletionTracked(input?: {
  title?: string;
  labels?: IssueLabel[];
  body?: string;
}): boolean;

export type ClosureCompletion = "partial" | "complete" | null;

export function evaluateIssueClosure(input?: {
  body?: string;
  comments?: string[];
  completionTracked?: boolean;
  linkedPrCompletion?: ClosureCompletion;
}): { allowed: boolean; violations: string[] };
