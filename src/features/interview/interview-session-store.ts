// Server-only persistence for the learner's current interview session (#177).
// One row per learner; saving overwrites it (resume-across-refresh). Best effort
// and never throws: no-ops signed-out / unconfigured / pre-migration. The pure
// row<->state mappers are exported for unit tests.
import { createClient } from "@/lib/supabase/server";
import {
  SESSION_DURATIONS,
  SESSION_PHASES,
  type SessionDuration,
  type SessionMode,
  type SessionState,
  type SessionStatus
} from "./session-machine";

export type SessionWriteOutcome = "ok" | "signed_out" | "error";

const MODES: SessionMode[] = ["practice", "interview"];
const STATUSES: SessionStatus[] = ["in_progress", "completed", "abandoned"];
const LAST_PHASE_INDEX = SESSION_PHASES.length - 1;

type SessionRow = {
  problem_id: string;
  mode: string;
  duration_minutes: number;
  phase_index: number;
  elapsed_seconds: number;
  status: string;
};

/** Coerce a stored row into a valid SessionState (clamps/whitelists defensively). */
export function rowToSessionState(row: SessionRow): SessionState {
  const mode: SessionMode = MODES.includes(row.mode as SessionMode) ? (row.mode as SessionMode) : "practice";
  const status: SessionStatus = STATUSES.includes(row.status as SessionStatus)
    ? (row.status as SessionStatus)
    : "in_progress";
  const durationMinutes: SessionDuration = SESSION_DURATIONS.includes(row.duration_minutes as SessionDuration)
    ? (row.duration_minutes as SessionDuration)
    : 45;
  return {
    problemId: row.problem_id,
    mode,
    durationMinutes,
    phaseIndex: Math.min(Math.max(0, Math.trunc(row.phase_index)), LAST_PHASE_INDEX),
    elapsedSeconds: Math.max(0, Math.trunc(row.elapsed_seconds)),
    status
  };
}

/** The trusted row shape written for a session (user_id is stamped by the caller). */
export function sessionStateToRow(state: SessionState): SessionRow {
  return {
    problem_id: state.problemId,
    mode: MODES.includes(state.mode) ? state.mode : "practice",
    duration_minutes: SESSION_DURATIONS.includes(state.durationMinutes) ? state.durationMinutes : 45,
    phase_index: Math.min(Math.max(0, Math.trunc(state.phaseIndex)), LAST_PHASE_INDEX),
    elapsed_seconds: Math.max(0, Math.trunc(state.elapsedSeconds)),
    status: STATUSES.includes(state.status) ? state.status : "in_progress"
  };
}

/** The signed-in learner's current session, or null (signed out / none / error). */
export async function getCurrentSession(): Promise<SessionState | null> {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("problem_id,mode,duration_minutes,phase_index,elapsed_seconds,status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return rowToSessionState(data as SessionRow);
}

/** Upsert the learner's current session. */
export async function saveCurrentSession(state: SessionState): Promise<SessionWriteOutcome> {
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
  const { error } = await supabase
    .from("interview_sessions")
    .upsert({ user_id: user.id, ...sessionStateToRow(state), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return error ? "error" : "ok";
}
