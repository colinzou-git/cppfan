/*
 * Atomic stale-session fallback for the timed interview page (#608 Problem B).
 *
 * The chosen session's problem may no longer resolve — a saved user-created
 * problem was archived, deleted, or unpublished. The page previously showed the
 * first native problem while the runner, code draft, judge submission, and
 * follow-up kept acting on the stale `problemId`, so the learner saw one problem
 * and operated on another. This picks the fallback and, crucially, returns a
 * FRESH session bound to the fallback problem's id, so every surface uses the
 * same id and no stale notes/code/timer/judge identity carry over.
 *
 * Pure and dependency-injected (the resolver is passed in) so it is unit-testable
 * without the DB; the page performs the durable persistence of the replacement.
 */

import { createSession, type SessionDuration, type SessionState } from "./session-machine";
import type { InterviewProblem } from "./problem-catalog";
import type { ResolvedInterviewProblemRef } from "./interview-problem-resolver";

export type SessionFallbackResult = {
  state: SessionState;
  problem: InterviewProblem | null;
  /** True when the originally chosen problem was unresolvable and replaced. */
  staleReplaced: boolean;
};

export async function resolveSessionWithFallback(input: {
  saved: SessionState | null;
  requestedProblem: ResolvedInterviewProblemRef | null;
  fallbackProblemId: string;
  durationMinutes: SessionDuration;
  resolve: (id: string) => Promise<ResolvedInterviewProblemRef | null>;
}): Promise<SessionFallbackResult> {
  const { saved, requestedProblem, fallbackProblemId, durationMinutes, resolve } = input;

  // A `?problem=<id>` entry point starts a fresh session on that problem unless
  // the saved session is already on it; otherwise resume the saved session, or
  // start fresh on the fallback problem.
  const startedFresh = Boolean(requestedProblem && (!saved || saved.problemId !== requestedProblem.problem.id));
  let state: SessionState =
    startedFresh && requestedProblem
      ? createSession({ problemId: requestedProblem.problem.id, mode: "practice", durationMinutes })
      : (saved ?? createSession({ problemId: fallbackProblemId, mode: "practice", durationMinutes }));
  // We are resuming the learner's saved session only when we did not start fresh
  // and a saved session actually exists.
  let resumed = !startedFresh && Boolean(saved);

  let ref = await resolve(state.problemId);
  let staleReplaced = false;

  if (!ref && fallbackProblemId && fallbackProblemId !== state.problemId) {
    // The chosen problem is gone: replace the WHOLE session, not just the display.
    state = createSession({ problemId: fallbackProblemId, mode: "practice", durationMinutes });
    ref = await resolve(state.problemId);
    resumed = false;
    staleReplaced = true;
  }

  // A resumed session keeps the version it was bound to — never silently rebound
  // to a newer publication (submit-time resolution reports staleness instead,
  // #608/#612). A fresh session (or a saved one that predates version binding)
  // takes the version actually in front of the learner.
  const keepSavedVersion = resumed && state.contentVersionId != null;
  state = {
    ...state,
    contentVersionId: keepSavedVersion ? state.contentVersionId : (ref?.contentVersionId ?? null)
  };

  return { state, problem: ref?.problem ?? null, staleReplaced };
}
