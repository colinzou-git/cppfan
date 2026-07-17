// Timed coding-interview session state machine (#177 / #174). Pure and
// serializable so it can drive the UI, persist across refresh, and be tested
// deterministically. Solutions stay hidden until the appropriate state.

export const SESSION_PHASES = [
  "clarification",
  "examples",
  "baseline",
  "optimization",
  "implementation",
  "testing",
  "complexity",
  "follow_up",
  "reflection"
] as const;

export type SessionPhase = (typeof SESSION_PHASES)[number];

export type SessionMode = "practice" | "interview";
export type SessionDuration = 35 | 45 | 50;
export type SessionStatus = "in_progress" | "paused" | "completed" | "abandoned";
export type PhaseElapsedSeconds = Record<SessionPhase, number>;
export type PhaseNotes = Partial<Record<SessionPhase, string>>;

export const SESSION_DURATIONS: SessionDuration[] = [35, 45, 50];

export type SessionState = {
  sessionId: string | null;
  problemId: string;
  /**
   * Immutable published content version this session is bound to (#612): the
   * user_content_versions.id for a user problem, or null for a native problem.
   * Re-derived from the current publication on load, so judge submissions and
   * prior-exposure evidence reference the version actually in front of the
   * learner, not the schema version (which stays 1 across publications).
   */
  contentVersionId?: string | null;
  mode: SessionMode;
  durationMinutes: SessionDuration;
  phaseIndex: number;
  elapsedSeconds: number;
  phaseElapsedSeconds: PhaseElapsedSeconds;
  notesByPhase: PhaseNotes;
  codeDraft: string;
  testNotes: string;
  assistanceUsed: boolean;
  abandonmentReason: string | null;
  status: SessionStatus;
  startedAt: string | null;
  completedAt: string | null;
};

export function emptyPhaseElapsedSeconds(): PhaseElapsedSeconds {
  return Object.fromEntries(SESSION_PHASES.map((phase) => [phase, 0])) as PhaseElapsedSeconds;
}

export function createSession(input: {
  problemId: string;
  mode: SessionMode;
  durationMinutes: SessionDuration;
  sessionId?: string | null;
  startedAt?: string | null;
  contentVersionId?: string | null;
}): SessionState {
  if (!SESSION_DURATIONS.includes(input.durationMinutes)) {
    throw new Error(`unsupported session duration: ${input.durationMinutes}`);
  }
  return {
    sessionId: input.sessionId ?? null,
    problemId: input.problemId,
    contentVersionId: input.contentVersionId ?? null,
    mode: input.mode,
    durationMinutes: input.durationMinutes,
    phaseIndex: 0,
    elapsedSeconds: 0,
    phaseElapsedSeconds: emptyPhaseElapsedSeconds(),
    notesByPhase: {},
    codeDraft: "",
    testNotes: "",
    assistanceUsed: false,
    abandonmentReason: null,
    status: "in_progress",
    startedAt: input.startedAt ?? null,
    completedAt: null
  };
}

export function currentPhase(state: SessionState): SessionPhase {
  return SESSION_PHASES[state.phaseIndex];
}

const LAST_PHASE_INDEX = SESSION_PHASES.length - 1;

function finishedAt(state: SessionState): string | null {
  return state.completedAt ?? new Date().toISOString();
}

/** Move to the next phase; completing the session when advancing past the last. */
export function advancePhase(state: SessionState): SessionState {
  if (state.status !== "in_progress") {
    return state;
  }
  if (state.phaseIndex >= LAST_PHASE_INDEX) {
    return { ...state, status: "completed", completedAt: finishedAt(state) };
  }
  return { ...state, phaseIndex: state.phaseIndex + 1 };
}

/** Go back a phase. Practice mode only — an interview is forward-only. */
export function goToPreviousPhase(state: SessionState): SessionState {
  if (state.status !== "in_progress" || state.mode !== "practice" || state.phaseIndex === 0) {
    return state;
  }
  return { ...state, phaseIndex: state.phaseIndex - 1 };
}

/** Pause active practice timing. Interview mode stays fixed-duration and cannot pause. */
export function pauseSession(state: SessionState): SessionState {
  if (state.status !== "in_progress" || state.mode !== "practice") {
    return state;
  }
  return { ...state, status: "paused" };
}

/** Resume a paused practice session without adding elapsed time. */
export function resumeSession(state: SessionState): SessionState {
  if (state.status !== "paused") {
    return state;
  }
  return { ...state, status: "in_progress" };
}

/** Accumulate elapsed time (e.g. from a UI timer); a no-op once finished. */
export function tick(state: SessionState, seconds: number): SessionState {
  if (state.status !== "in_progress" || seconds <= 0) {
    return state;
  }
  const wholeSeconds = Math.trunc(seconds);
  const phase = currentPhase(state);
  return {
    ...state,
    elapsedSeconds: state.elapsedSeconds + wholeSeconds,
    phaseElapsedSeconds: {
      ...emptyPhaseElapsedSeconds(),
      ...state.phaseElapsedSeconds,
      [phase]: (state.phaseElapsedSeconds[phase] ?? 0) + wholeSeconds
    }
  };
}

export function budgetSeconds(state: SessionState): number {
  return state.durationMinutes * 60;
}

export function remainingSeconds(state: SessionState): number {
  return Math.max(0, budgetSeconds(state) - state.elapsedSeconds);
}

export function isOverBudget(state: SessionState): boolean {
  return state.elapsedSeconds > budgetSeconds(state);
}

export function completeSession(state: SessionState): SessionState {
  return state.status === "in_progress" || state.status === "paused"
    ? { ...state, status: "completed", completedAt: finishedAt(state) }
    : state;
}

export function abandonSession(state: SessionState): SessionState {
  return state.status === "in_progress" || state.status === "paused"
    ? {
        ...state,
        status: "abandoned",
        abandonmentReason: state.abandonmentReason ?? "manual_stop",
        completedAt: finishedAt(state)
      }
    : state;
}

export function updatePhaseNote(state: SessionState, phase: SessionPhase, note: string): SessionState {
  return {
    ...state,
    notesByPhase: {
      ...state.notesByPhase,
      [phase]: note
    }
  };
}

export function updateSessionEvidence(
  state: SessionState,
  patch: Partial<Pick<SessionState, "codeDraft" | "testNotes" | "assistanceUsed" | "abandonmentReason">>
): SessionState {
  return { ...state, ...patch };
}

/**
 * Whether the reference solution may be revealed. Hidden throughout an interview;
 * in practice it unlocks only at the reflection phase or once the session is
 * completed — never earlier.
 */
export function canRevealSolution(state: SessionState): boolean {
  if (state.status === "completed") {
    return true;
  }
  return state.mode === "practice" && currentPhase(state) === "reflection";
}
