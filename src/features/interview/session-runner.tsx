"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSession } from "./interview-session-actions";
import { submitJudgeAttempt } from "./judge-actions";
import {
  SESSION_DURATIONS,
  advancePhase,
  abandonSession,
  budgetSeconds,
  canRevealSolution,
  completeSession,
  createSession,
  currentPhase,
  goToPreviousPhase,
  isOverBudget,
  pauseSession,
  remainingSeconds,
  resumeSession,
  SESSION_PHASES,
  tick,
  updatePhaseNote,
  updateSessionEvidence,
  type SessionDuration,
  type SessionMode,
  type SessionPhase,
  type SessionState
} from "./session-machine";

// Persist elapsed time on a coarse cadence so a refresh resumes near the real
// time without writing to the database every second.
const PERSIST_EVERY_SECONDS = 20;

function newClientSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function ensureClientSessionIdentity(state: SessionState): SessionState {
  return state.sessionId
    ? state
    : {
        ...state,
        sessionId: newClientSessionId(),
        startedAt: state.startedAt ?? new Date().toISOString()
      };
}

/** mm:ss for a non-negative seconds count (used for the live remaining-time clock). */
function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.trunc(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const PHASE_LABEL: Record<SessionPhase, string> = {
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
  // Initialize from the server-provided state verbatim so the first client render
  // matches SSR exactly. Client-only identity (random sessionId / startedAt) is
  // assigned after mount in the effect below — generating it during the useState
  // initializer ran on both server and client with different values, producing a
  // hydration text mismatch (React #418) on the rendered session id (#177).
  const [session, setSession] = useState<SessionState>(initialState);
  const [notice, setNotice] = useState<string | null>(null);
  const [judgeNotice, setJudgeNotice] = useState<string | null>(null);
  const [, startSaveTransition] = useTransition();
  const [isJudgePending, startJudgeTransition] = useTransition();

  function persist(next: SessionState) {
    const withIdentity = ensureClientSessionIdentity(next);
    startSaveTransition(async () => {
      const result = await saveSession(withIdentity);
      if (result.status === "signed_out") {
        setNotice("Sign in to save this session across refreshes.");
      } else if (result.status === "error") {
        setNotice("Could not save your session just now.");
      } else {
        setNotice(null);
      }
    });
  }

  function apply(next: SessionState) {
    const withIdentity = ensureClientSessionIdentity(next);
    setSession(withIdentity);
    persist(withIdentity);
  }

  function startSession(mode: SessionMode, durationMinutes: SessionDuration) {
    apply(
      createSession({
        problemId: session.problemId,
        mode,
        durationMinutes,
        sessionId: newClientSessionId(),
        startedAt: new Date().toISOString()
      })
    );
  }

  function submitDraftToJudge() {
    setJudgeNotice(null);
    startJudgeTransition(async () => {
      const stableSession = ensureClientSessionIdentity(session);
      if (stableSession !== session) {
        setSession(stableSession);
        persist(stableSession);
      }
      const result = await submitJudgeAttempt({
        problemId: stableSession.problemId,
        source: stableSession.codeDraft,
        mode: stableSession.mode,
        compiler: "gcc",
        standard: "c++20",
        taskKind: "compile_and_run",
        interviewSessionId: stableSession.sessionId,
        sourceVersion: 1,
        assistanceUsed: stableSession.assistanceUsed,
        priorSolutionExposed: canRevealSolution(stableSession)
      });

      if (result.status === "queued") {
        setJudgeNotice(`Submission queued for ${result.visibleTestCount} visible and ${result.hiddenTestCount} hidden tests.`);
      } else if (result.status === "duplicate") {
        setJudgeNotice("This submission was already queued.");
      } else if (result.status === "signed_out") {
        setJudgeNotice("Sign in to queue this submission for judge feedback.");
      } else if (result.status === "unsupported_problem") {
        setJudgeNotice("Judge feedback is not available for this problem yet.");
      } else if (result.status === "invalid") {
        setJudgeNotice("Add a non-empty C++ draft before queuing judge feedback.");
      } else {
        setJudgeNotice("Could not queue judge feedback just now.");
      }
    });
  }

  const phase = currentPhase(session);
  const inProgress = session.status === "in_progress";
  const paused = session.status === "paused";
  const atFirstPhase = session.phaseIndex === 0;

  // Assign client-only session identity once, after hydration, so it never
  // diverges from the SSR markup. A fresh (unsaved) session starts without an id;
  // this gives it a stable one for persistence and the judge without a mismatch.
  useEffect(() => {
    setSession((prev) => ensureClientSessionIdentity(prev));
  }, []);

  // Live timer: while in progress, accrue one second at a time and persist the
  // elapsed time on a coarse cadence so a refresh resumes near where the learner
  // left off. The persist ref avoids resubscribing the interval each tick.
  const persistRef = useRef(persist);
  persistRef.current = persist;
  useEffect(() => {
    if (session.status !== "in_progress") {
      return;
    }
    const id = setInterval(() => {
      setSession((prev) => {
        if (prev.status !== "in_progress") {
          return prev;
        }
        const next = tick(prev, 1);
        if (next.elapsedSeconds % PERSIST_EVERY_SECONDS === 0) {
          persistRef.current(next);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session.status]);

  const remaining = remainingSeconds(session);
  const overBudget = isOverBudget(session);
  const overBy = Math.max(0, session.elapsedSeconds - budgetSeconds(session));
  const phaseNote = session.notesByPhase[phase] ?? "";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]" data-testid="session-runner" data-status={session.status}>
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <h2 className="font-bold text-slate-900">{problemTitle}</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{problemPrompt}</p>
        <p className="mt-2 text-xs font-medium text-slate-500" data-testid="session-meta">
          {session.mode} · {session.durationMinutes} min budget · session {session.sessionId?.slice(0, 8)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Session mode">
          {(["practice", "interview"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={session.mode === mode ? "default" : "secondary"}
              aria-pressed={session.mode === mode}
              onClick={() => startSession(mode, session.durationMinutes)}
              data-testid={`session-mode-${mode}`}
            >
              {mode === "practice" ? "Practice" : "Interview"}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Session duration">
          {SESSION_DURATIONS.map((duration) => (
            <Button
              key={duration}
              type="button"
              variant={session.durationMinutes === duration ? "default" : "secondary"}
              aria-pressed={session.durationMinutes === duration}
              onClick={() => startSession(session.mode, duration)}
              data-testid={`session-duration-${duration}`}
            >
              {duration} min
            </Button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2" data-testid="session-timer" data-over-budget={overBudget}>
          <span
            className={`font-mono text-2xl font-black tabular-nums ${overBudget ? "text-rose-700" : "text-slate-900"}`}
            role="timer"
            aria-live="off"
            aria-label={overBudget ? "Time over budget" : "Time remaining"}
            data-testid="session-timer-value"
          >
            {overBudget ? `+${formatClock(overBy)}` : formatClock(remaining)}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {overBudget ? "over budget" : "remaining"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm lg:row-span-4">
        <h3 className="text-sm font-black text-slate-900">Session evidence</h3>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-800" htmlFor="session-phase-note">
            Current phase notes
            <textarea
              id="session-phase-note"
              className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800"
              value={phaseNote}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSession((prev) => updatePhaseNote(prev, phase, value));
              }}
              onBlur={(event) => apply(updatePhaseNote(session, phase, event.currentTarget.value))}
              data-testid="session-phase-note"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-800" htmlFor="session-code-draft">
            C++ draft
            <textarea
              id="session-code-draft"
              className="min-h-36 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-normal text-slate-800"
              value={session.codeDraft}
              onInput={(event) => {
                const value = event.currentTarget.value;
                setSession((prev) => updateSessionEvidence(prev, { codeDraft: value }));
              }}
              onBlur={(event) => apply(updateSessionEvidence(session, { codeDraft: event.currentTarget.value }))}
              data-testid="session-code-draft"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-800" htmlFor="session-test-notes">
            Test notes
            <textarea
              id="session-test-notes"
              className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800"
              value={session.testNotes}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSession((prev) => updateSessionEvidence(prev, { testNotes: value }));
              }}
              onBlur={(event) => apply(updateSessionEvidence(session, { testNotes: event.currentTarget.value }))}
              data-testid="session-test-notes"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={session.assistanceUsed}
              onChange={(event) => apply(updateSessionEvidence(session, { assistanceUsed: event.target.checked }))}
              data-testid="session-assistance-used"
            />
            Interviewer assistance used
          </label>
          <div className="grid gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={submitDraftToJudge}
              disabled={isJudgePending || session.codeDraft.trim().length === 0}
              data-testid="session-submit-judge"
            >
              {isJudgePending ? "Queuing..." : "Queue judge run"}
            </Button>
            {judgeNotice ? (
              <p className="text-xs font-semibold text-slate-600" role="status" data-testid="session-judge-notice">
                {judgeNotice}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ol className="flex flex-wrap gap-2" aria-label="Session phases">
        {SESSION_PHASES.map((p, i) => (
          <li
            key={p}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              i === session.phaseIndex && (inProgress || paused)
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
          : session.status === "abandoned"
            ? "Session abandoned - keep the evidence for review."
            : paused
              ? `Session paused - current phase: ${PHASE_LABEL[phase]}`
              : `Current phase: ${PHASE_LABEL[phase]}`}
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
              <>
                <Button type="button" variant="secondary" onClick={() => apply(goToPreviousPhase(session))} disabled={atFirstPhase} data-testid="session-prev">
                  Previous phase
                </Button>
                <Button type="button" variant="secondary" onClick={() => apply(pauseSession(session))} data-testid="session-pause">
                  Pause
                </Button>
              </>
            ) : null}
            <Button type="button" onClick={() => apply(advancePhase(session))} data-testid="session-next">
              Next phase
            </Button>
            <Button type="button" variant="secondary" onClick={() => apply(completeSession(session))} data-testid="session-complete">
              Complete
            </Button>
            <Button type="button" variant="secondary" onClick={() => apply(abandonSession(session))} data-testid="session-abandon">
              Abandon
            </Button>
          </>
        ) : paused ? (
          <>
            <Button type="button" onClick={() => apply(resumeSession(session))} data-testid="session-resume">
              Resume
            </Button>
            <Button type="button" variant="secondary" onClick={() => apply(completeSession(session))} data-testid="session-complete">
              Complete
            </Button>
            <Button type="button" variant="secondary" onClick={() => apply(abandonSession(session))} data-testid="session-abandon">
              Abandon
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => startSession(session.mode, session.durationMinutes)} data-testid="session-restart">
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
