// Problem-level transfer selection for the study plan (#180). Pure and
// deterministic. After remediation on a pattern, pick a SIMILAR but NOT IDENTICAL
// problem in that pattern: prefer a genuinely unseen problem (so it counts as
// readiness evidence and is never a revealed problem), and otherwise avoid the
// most-recently attempted one (spacing repeat practice after a success instead of
// repeating it immediately). Reads only the static catalog and the learner's
// evidence; never touches FSRS.
import { getInterviewProblemsByGroup } from "./problem-catalog";
import type { ProblemGroup } from "./problem-catalog";
import type { InterviewEvidence } from "./readiness";

export type TransferPick = {
  problemId: string;
  title: string;
  /** True when the learner has no prior evidence on this problem. */
  unseen: boolean;
};

/**
 * Choose the next transfer problem in a pattern. Deterministic: an unseen problem
 * (in catalog order) wins; if every problem has been attempted, pick the
 * least-recently attempted one that is not the most-recent attempt.
 */
export function selectTransferProblem(pattern: ProblemGroup, evidence: InterviewEvidence[]): TransferPick | null {
  const problems = getInterviewProblemsByGroup(pattern);
  if (problems.length === 0) {
    return null;
  }

  const patternEvidence = evidence.filter((e) => e.pattern === pattern);
  const attempted = new Set(patternEvidence.map((e) => e.problemId));

  // 1) Prefer a genuinely unseen problem — strongest, never a revealed problem.
  const unseen = problems.find((p) => !attempted.has(p.id));
  if (unseen) {
    return { problemId: unseen.id, title: unseen.title, unseen: true };
  }

  // 2) All attempted: avoid the most-recent (no immediate repeat after success),
  //    preferring the least-recently attempted.
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

  const alternatives = problems.filter((p) => p.id !== mostRecentId);
  const pool = alternatives.length > 0 ? alternatives : problems;
  const pick = [...pool].sort(
    (a, b) => (lastAttemptAt.get(a.id) ?? 0) - (lastAttemptAt.get(b.id) ?? 0) || a.id.localeCompare(b.id)
  )[0];
  return { problemId: pick.id, title: pick.title, unseen: false };
}
