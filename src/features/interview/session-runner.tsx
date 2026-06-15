"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSession } from "./interview-session-actions";
import {
  advancePhase,
  canRevealSolution,
  completeSession,
  createSession,
  currentPhase,
  goToPreviousPhase,
  SESSION_PHASES,
  type SessionState
} from "./session-machine";

const PHASE_LABEL: Record<string, string> = {
  clarification: "Clarify the problem",
  examples: "Work examples",
  baseline: "Baseline approach",
  optimization: "Optimize",
  implementation: "Implement",
  testing: "Test",
  complexity: "Analyze complexity",
  follow_up: "Follow-up",
  reflection: "Reflect"
};

/**
 * Drives a timed interview session with the deterministic session-machine and
 * persists each transition (best effort) so progress resumes across refresh
 * (#177). Interview mode is forward-only; practice allows going back. The solution
 * stays gated until the machine permits it.
 */
export function SessionRunner({
  initialState,
  problemTitle,
  problemPrompt,
  authenticated
}: {
  initialState: SessionState;
  problemTitle: string;
  problemPrompt: string;
  authenticated: boolean;
}) {
  const [session, setSession] = useState<SessionState>(initialState);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function apply(next: SessionState) {
    setSession(next);
    startTransition(async () => {
      const result = await saveSession(next);
      if (result.status === "signed_out") {
        setNotice("Sign in to save this session across refreshes.");
      } else if (result.status === "error") {
        setNotice("Could not save your session just now.");
      } else {
        setNotice(null);
      }
    });
  }

  const phase = currentPhase(session);
  const inProgress = session.status === "in_progress";
  const atFirstPhase = session.phaseIndex === 0;

  return (
    <div className="grid gap-4" data-testid="session-runner" data-status={session.status}>
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <h2 className="font-bold text-slate-900">{problemTitle}</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{problemPrompt}</p>
        <p className="mt-2 text-xs font-medium text-slate-500">
          {session.mode} · {session.durationMinutes} min budget
        </p>
      </div>

      <ol className="flex flex-wrap gap-2" aria-label="Session phases">
        {SESSION_PHASES.map((p, i) => (
          <li
            key={p}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              i === session.phaseIndex && inProgress
                ? "bg-blue-600 text-white"
                : i < session.phaseIndex || session.status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {PHASE_LABEL[p] ?? p}
          </li>
        ))}
      </ol>

      <p className="text-sm font-semibold text-slate-800" data-testid="session-status">
        {session.status === "completed"
          ? "Session complete — review your approach and the solution."
          : `Current phase: ${PHASE_LABEL[phase] ?? phase}`}
      </p>

      {canRevealSolution(session) ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900" data-testid="session-reveal">
          You can now compare against the reference approach.
        </p>
      ) : null}

      {notice ? (
        <p className="text-sm font-semibold text-amber-700" role="alert" data-testid="session-signin-notice">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {inProgress ? (
          <>
            {session.mode === "practice" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => apply(goToPreviousPhase(session))}
                disabled={atFirstPhase}
                data-testid="session-prev"
              >
                Previous phase
              </Button>
            ) : null}
            <Button type="button" onClick={() => apply(advancePhase(session))} data-testid="session-next">
              Next phase
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => apply(completeSession(session))}
              data-testid="session-complete"
            >
              Complete
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() =>
              apply(
                createSession({
                  problemId: session.problemId,
                  mode: session.mode,
                  durationMinutes: session.durationMinutes
                })
              )
            }
            data-testid="session-restart"
          >
            Start over
          </Button>
        )}
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save your session progress across sessions.</p>
      ) : null}
    </div>
  );
}
