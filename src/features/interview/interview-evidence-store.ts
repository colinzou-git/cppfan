// Server-only persistence for per-learner interview practice evidence (#180).
// Append-only log of self-reported session outcomes; reads are bounded (recent
// window + row cap + indexed order) so they stay cheap as history grows. Tracked
// SEPARATELY from FSRS. The pure row->evidence mapper is exported for unit tests.
import { createClient } from "@/lib/supabase/server";
import { GROUP_LABELS } from "./interview-catalog-view";
import type { ProblemGroup } from "./problem-catalog";
import type { InterviewContext, InterviewEvidence } from "./readiness";

export type EvidenceWriteOutcome = "ok" | "signed_out" | "error";

const VALID_PATTERNS = new Set<string>(Object.keys(GROUP_LABELS));
const MODES = new Set<InterviewEvidence["mode"]>(["practice", "interview"]);
const CONTEXTS = new Set<InterviewContext>(["diagnostic", "guided", "independent", "mock"]);
export type FollowUpResult = "none" | "passed" | "partial" | "failed";
const FOLLOW_UPS = new Set<FollowUpResult>(["none", "passed", "partial", "failed"]);

const DEFAULT_WINDOW_DAYS = 21;
const DEFAULT_LIMIT = 500;
const DAY_MS = 24 * 60 * 60 * 1000;

export type EvidenceInput = {
  pattern: string;
  problemId: string;
  unseen: boolean;
  mode: string;
  correct: boolean;
  hintsUsed: number;
  context: string;
  // Optional evidence-model detail (#180).
  timeToApproachSeconds?: number | null;
  timeToImplementationSeconds?: number | null;
  followUpResult?: string;
  problemVersion?: number;
};

/** The trusted, normalized column values for an evidence row (no user_id/timestamp). */
export type NormalizedEvidenceRow = {
  pattern: string;
  problem_id: string;
  unseen: boolean;
  mode: string;
  correct: boolean;
  hints_used: number;
  context: string;
  time_to_approach_seconds: number | null;
  time_to_implementation_seconds: number | null;
  follow_up_result: FollowUpResult;
  problem_version: number;
};

function normalizeSeconds(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.trunc(value);
}

/**
 * Validate and clamp a raw evidence input into trusted column values. Pure and
 * exported for unit tests. Whitelists pattern/mode/context/follow-up, clamps hints
 * and timings to >= 0, and floors the problem version at 1.
 */
export function normalizeEvidenceRow(input: EvidenceInput): NormalizedEvidenceRow {
  return {
    pattern: input.pattern,
    problem_id: input.problemId,
    unseen: Boolean(input.unseen),
    mode: MODES.has(input.mode as InterviewEvidence["mode"]) ? input.mode : "practice",
    correct: Boolean(input.correct),
    hints_used: Math.max(0, Math.trunc(Number(input.hintsUsed) || 0)),
    context: CONTEXTS.has(input.context as InterviewContext) ? input.context : "independent",
    time_to_approach_seconds: normalizeSeconds(input.timeToApproachSeconds),
    time_to_implementation_seconds: normalizeSeconds(input.timeToImplementationSeconds),
    follow_up_result: FOLLOW_UPS.has(input.followUpResult as FollowUpResult)
      ? (input.followUpResult as FollowUpResult)
      : "none",
    problem_version: Math.max(1, Math.trunc(Number(input.problemVersion) || 1))
  };
}

type EvidenceRow = {
  pattern: string;
  problem_id: string;
  unseen: boolean;
  mode: string;
  correct: boolean;
  hints_used: number;
  context: string;
  completed_at: string;
};

/** Coerce stored rows into valid InterviewEvidence (whitelists/clamps defensively). */
export function rowsToEvidence(rows: EvidenceRow[]): InterviewEvidence[] {
  const evidence: InterviewEvidence[] = [];
  for (const row of rows) {
    if (!VALID_PATTERNS.has(row.pattern) || typeof row.problem_id !== "string" || !row.problem_id) {
      continue;
    }
    const mode = MODES.has(row.mode as InterviewEvidence["mode"]) ? (row.mode as InterviewEvidence["mode"]) : "practice";
    const context = CONTEXTS.has(row.context as InterviewContext) ? (row.context as InterviewContext) : "independent";
    const completedAtMs = Date.parse(row.completed_at);
    evidence.push({
      pattern: row.pattern as ProblemGroup,
      problemId: row.problem_id,
      unseen: Boolean(row.unseen),
      mode,
      correct: Boolean(row.correct),
      hintsUsed: Math.max(0, Math.trunc(row.hints_used)),
      context,
      completedAtMs: Number.isNaN(completedAtMs) ? 0 : completedAtMs
    });
  }
  return evidence;
}

/** The signed-in learner's recent interview evidence (bounded), or [] otherwise. */
export async function getRecentInterviewEvidence(
  now: number = Date.now(),
  windowDays: number = DEFAULT_WINDOW_DAYS
): Promise<InterviewEvidence[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const since = new Date(now - windowDays * DAY_MS).toISOString();
  const { data, error } = await supabase
    .from("interview_evidence")
    .select("pattern,problem_id,unseen,mode,correct,hints_used,context,completed_at")
    .eq("user_id", user.id)
    .gte("completed_at", since)
    .order("completed_at", { ascending: false })
    .limit(DEFAULT_LIMIT);
  if (error || !data) {
    return [];
  }
  return rowsToEvidence(data as EvidenceRow[]);
}

/** Append one self-reported interview outcome for the signed-in learner. */
export async function recordInterviewEvidence(input: EvidenceInput): Promise<EvidenceWriteOutcome> {
  if (!VALID_PATTERNS.has(input.pattern) || typeof input.problemId !== "string" || !input.problemId) {
    return "error";
  }
  const supabase = await createClient();
  if (!supabase) {
    return "signed_out";
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return "signed_out";
  }
  const row = {
    user_id: user.id,
    ...normalizeEvidenceRow(input),
    completed_at: new Date().toISOString()
  };
  const { error } = await supabase.from("interview_evidence").insert(row);
  return error ? "error" : "ok";
}
