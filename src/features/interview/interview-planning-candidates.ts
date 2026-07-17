/*
 * Normalized interview candidate source for the study planner (#613). The plan
 * router previously read only the native static catalog, so a learner's own
 * published interview problems were never chosen for timed plan tasks or transfer
 * selection. This unifies native problems and the owner's published user problems
 * into one candidate shape, so planning treats both alike while honoring the
 * per-item recommendation opt-out and immutable content version.
 *
 * The pure selectors here (nativeInterviewCandidates, selectTransferCandidate)
 * are fully unit-testable; getInterviewPlanningCandidates() adds the server-only
 * user source and is best-effort (native-only without a backend).
 */

import { getInterviewProblems, type ProblemGroup } from "./problem-catalog";
import { getMyPlanningInterviewCandidates } from "./user-interview-source";
import type { InterviewEvidence } from "./readiness";
import type { TransferPick } from "./interview-transfer";

export type InterviewPlanningCandidate = {
  problemId: string;
  source: "native" | "user";
  title: string;
  group: ProblemGroup;
  patternTags: string[];
  interviewCore: boolean;
  /** Custom items may opt out of AUTOMATIC selection (still manually selectable). */
  recommendationEnabled: boolean;
  /** Immutable published version for user items; absent for native. */
  contentVersionId?: string;
};

/** Native catalog problems as planning candidates (pure, testable). */
export function nativeInterviewCandidates(): InterviewPlanningCandidate[] {
  return getInterviewProblems().map((p) => ({
    problemId: p.id,
    source: "native",
    title: p.title,
    group: p.group,
    patternTags: p.patternTags,
    interviewCore: p.interviewCore ?? false,
    recommendationEnabled: true
  }));
}

/**
 * All planning candidates: native + the authenticated owner's published user
 * problems. Best-effort — returns native only when there is no backend.
 */
export async function getInterviewPlanningCandidates(): Promise<InterviewPlanningCandidate[]> {
  const user = await getMyPlanningInterviewCandidates().catch(() => []);
  return [...nativeInterviewCandidates(), ...user];
}

/**
 * Choose the next transfer problem in a pattern from a candidate list (native +
 * custom), mirroring selectTransferProblem's spacing policy but eligible across
 * sources. Only candidates whose group matches AND that are recommendation-
 * enabled are auto-selectable. Prefers a genuinely unseen problem; otherwise the
 * least-recently attempted, avoiding an immediate repeat of the most recent.
 */
export function selectTransferCandidate(
  pattern: ProblemGroup,
  evidence: InterviewEvidence[],
  candidates: InterviewPlanningCandidate[]
): TransferPick | null {
  const eligible = candidates.filter((c) => c.group === pattern && c.recommendationEnabled);
  if (eligible.length === 0) {
    return null;
  }

  const patternEvidence = evidence.filter((e) => e.pattern === pattern);
  const attempted = new Set(patternEvidence.map((e) => e.problemId));

  // 1) Prefer a genuinely unseen problem (in candidate order: native then user).
  const unseen = eligible.find((c) => !attempted.has(c.problemId));
  if (unseen) {
    return { problemId: unseen.problemId, title: unseen.title, unseen: true };
  }

  // 2) All attempted: avoid the most-recent, preferring least-recently attempted.
  const lastAttemptAt = new Map<string, number>();
  let mostRecentMs = -1;
  let mostRecentId: string | null = null;
  for (const e of patternEvidence) {
    lastAttemptAt.set(e.problemId, Math.max(lastAttemptAt.get(e.problemId) ?? -1, e.completedAtMs));
    if (e.completedAtMs > mostRecentMs) {
      mostRecentMs = e.completedAtMs;
      mostRecentId = e.problemId;
    }
  }
  const alternatives = eligible.filter((c) => c.problemId !== mostRecentId);
  const pool = alternatives.length > 0 ? alternatives : eligible;
  const pick = [...pool].sort(
    (a, b) => (lastAttemptAt.get(a.problemId) ?? 0) - (lastAttemptAt.get(b.problemId) ?? 0) || a.problemId.localeCompare(b.problemId)
  )[0];
  return { problemId: pick.problemId, title: pick.title, unseen: false };
}

/** A direct, problem-specific session href — never a generic session URL (#613). */
export function interviewSessionHref(problemId: string): string {
  return `/interview/session?problem=${encodeURIComponent(problemId)}`;
}
