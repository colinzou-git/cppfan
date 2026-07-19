// Server-only persistence for interview sessions (#177).
// Maintains the learner's resumable current row and appends immutable evidence
// for completed/abandoned attempts, code revisions, and judge associations.
import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import {
  SESSION_DURATIONS,
  SESSION_PHASES,
  emptyPhaseElapsedSeconds,
  type PhaseElapsedSeconds,
  type PhaseNotes,
  type SessionDuration,
  type SessionMode,
  type SessionPhase,
  type SessionState,
  type SessionStatus
} from "./session-machine";

export type SessionWriteOutcome = "ok" | "signed_out" | "error";

const MODES: SessionMode[] = ["practice", "interview"];
const STATUSES: SessionStatus[] = ["in_progress", "paused", "completed", "abandoned"];
const LAST_PHASE_INDEX = SESSION_PHASES.length - 1;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SessionRow = {
  session_id?: string | null;
  problem_id: string;
  content_version_id?: string | null;
  mode: string;
  duration_minutes: number;
  phase_index: number;
  elapsed_seconds: number;
  phase_elapsed_seconds?: unknown;
  notes_by_phase?: unknown;
  code_draft?: string | null;
  test_notes?: string | null;
  assistance_used?: boolean | null;
  abandonment_reason?: string | null;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
};

export type SessionAttemptRow = {
  session_id: string;
  problem_id: string;
  content_version_id: string | null;
  mode: SessionMode;
  duration_minutes: SessionDuration;
  status: "completed" | "abandoned";
  final_phase_index: number;
  elapsed_seconds: number;
  phase_elapsed_seconds: PhaseElapsedSeconds;
  notes_by_phase: PhaseNotes;
  test_notes: string;
  assistance_used: boolean;
  abandonment_reason: string | null;
  started_at: string | null;
  completed_at: string;
};

export type SessionCodeRevisionRow = {
  session_id: string;
  content_version_id: string | null;
  source_hash: string;
  source_bytes: number;
  source_text: string;
};

function coerceObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function coercePhaseElapsedSeconds(value: unknown): PhaseElapsedSeconds {
  const source = coerceObject(value);
  const elapsed = emptyPhaseElapsedSeconds();
  for (const phase of SESSION_PHASES) {
    const raw = source[phase];
    elapsed[phase] = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
  }
  return elapsed;
}

function coerceNotes(value: unknown): PhaseNotes {
  const source = coerceObject(value);
  const notes: PhaseNotes = {};
  for (const phase of SESSION_PHASES) {
    const raw = source[phase];
    if (typeof raw === "string") {
      notes[phase as SessionPhase] = raw.slice(0, 4000);
    }
  }
  return notes;
}

function coerceUuid(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function coerceIso(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 64) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function sourceHash(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

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
    sessionId: coerceUuid(row.session_id),
    problemId: row.problem_id,
    contentVersionId: typeof row.content_version_id === "string" ? row.content_version_id : null,
    mode,
    durationMinutes,
    phaseIndex: Math.min(Math.max(0, Math.trunc(row.phase_index)), LAST_PHASE_INDEX),
    elapsedSeconds: Math.max(0, Math.trunc(row.elapsed_seconds)),
    phaseElapsedSeconds: coercePhaseElapsedSeconds(row.phase_elapsed_seconds),
    notesByPhase: coerceNotes(row.notes_by_phase),
    codeDraft: typeof row.code_draft === "string" ? row.code_draft.slice(0, 12000) : "",
    testNotes: typeof row.test_notes === "string" ? row.test_notes.slice(0, 4000) : "",
    assistanceUsed: Boolean(row.assistance_used),
    abandonmentReason: typeof row.abandonment_reason === "string" ? row.abandonment_reason.slice(0, 500) : null,
    status,
    startedAt: coerceIso(row.started_at),
    completedAt: coerceIso(row.completed_at)
  };
}

/** The trusted row shape written for a session (user_id is stamped by the caller). */
export function sessionStateToRow(state: SessionState): SessionRow {
  return {
    session_id: coerceUuid(state.sessionId),
    problem_id: state.problemId,
    content_version_id: state.contentVersionId ?? null,
    mode: MODES.includes(state.mode) ? state.mode : "practice",
    duration_minutes: SESSION_DURATIONS.includes(state.durationMinutes) ? state.durationMinutes : 45,
    phase_index: Math.min(Math.max(0, Math.trunc(state.phaseIndex)), LAST_PHASE_INDEX),
    elapsed_seconds: Math.max(0, Math.trunc(state.elapsedSeconds)),
    phase_elapsed_seconds: coercePhaseElapsedSeconds(state.phaseElapsedSeconds),
    notes_by_phase: coerceNotes(state.notesByPhase),
    code_draft: state.codeDraft.slice(0, 12000),
    test_notes: state.testNotes.slice(0, 4000),
    assistance_used: Boolean(state.assistanceUsed),
    abandonment_reason: state.abandonmentReason ? state.abandonmentReason.slice(0, 500) : null,
    status: STATUSES.includes(state.status) ? state.status : "in_progress",
    started_at: coerceIso(state.startedAt),
    completed_at: coerceIso(state.completedAt)
  };
}

export function sessionStateToAttemptRow(state: SessionState): SessionAttemptRow | null {
  const sessionId = coerceUuid(state.sessionId);
  if (!sessionId || (state.status !== "completed" && state.status !== "abandoned")) return null;
  return {
    session_id: sessionId,
    problem_id: state.problemId,
    content_version_id: coerceUuid(state.contentVersionId),
    mode: MODES.includes(state.mode) ? state.mode : "practice",
    duration_minutes: SESSION_DURATIONS.includes(state.durationMinutes) ? state.durationMinutes : 45,
    status: state.status,
    final_phase_index: Math.min(Math.max(0, Math.trunc(state.phaseIndex)), LAST_PHASE_INDEX),
    elapsed_seconds: Math.max(0, Math.trunc(state.elapsedSeconds)),
    phase_elapsed_seconds: coercePhaseElapsedSeconds(state.phaseElapsedSeconds),
    notes_by_phase: coerceNotes(state.notesByPhase),
    test_notes: state.testNotes.slice(0, 4000),
    assistance_used: Boolean(state.assistanceUsed),
    abandonment_reason: state.abandonmentReason ? state.abandonmentReason.slice(0, 500) : null,
    started_at: coerceIso(state.startedAt),
    completed_at: coerceIso(state.completedAt) ?? new Date().toISOString()
  };
}

export function sessionStateToCodeRevisionRow(state: SessionState): SessionCodeRevisionRow | null {
  const sessionId = coerceUuid(state.sessionId);
  const source = state.codeDraft.trim();
  if (!sessionId || source.length === 0) return null;
  const sourceText = state.codeDraft.slice(0, 12000);
  return {
    session_id: sessionId,
    content_version_id: coerceUuid(state.contentVersionId),
    source_hash: sourceHash(sourceText),
    source_bytes: new TextEncoder().encode(sourceText).length,
    source_text: sourceText
  };
}

/** The signed-in learner's current session, or null (signed out / none / error). */
export async function getCurrentSession(): Promise<SessionState | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("interview_sessions")
    .select(
      "session_id,problem_id,content_version_id,mode,duration_minutes,phase_index,elapsed_seconds,phase_elapsed_seconds,notes_by_phase,code_draft,test_notes,assistance_used,abandonment_reason,status,started_at,completed_at"
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToSessionState(data as SessionRow);
}

async function appendHistoricalEvidence(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, state: SessionState) {
  if (!supabase) return;
  const attempt = sessionStateToAttemptRow(state);
  if (attempt) {
    await supabase
      .from("interview_session_attempts")
      .upsert({ user_id: userId, ...attempt }, { onConflict: "session_id" });
  }
  const revision = sessionStateToCodeRevisionRow(state);
  if (revision) {
    await supabase
      .from("interview_session_code_revisions")
      .upsert({ user_id: userId, ...revision }, { onConflict: "session_id,source_hash" });
  }
}

/** Upsert the learner's current session and append durable evidence. */
export async function saveCurrentSession(state: SessionState): Promise<SessionWriteOutcome> {
  const supabase = await createClient();
  if (!supabase) return "signed_out";
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "signed_out";
  const { error } = await supabase
    .from("interview_sessions")
    .upsert({ user_id: user.id, ...sessionStateToRow(state), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return "error";
  await appendHistoricalEvidence(supabase, user.id, state);
  return "ok";
}
