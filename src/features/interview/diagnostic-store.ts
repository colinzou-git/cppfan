// Server-only persistence for the coding-refresh diagnostic (#175/#182).
// The latest scores remain the baseline read model; immutable attempt rows provide
// retake history and trend evidence. This self-assessment is recommendation context,
// never mastery or FSRS state.
import { createClient } from "@/lib/supabase/server";
import { diagnosticSections } from "./diagnostic";
import { diagnosticRetakeAvailability } from "./target-profile";

export type DiagnosticWriteOutcome =
  | { status: "ok"; attemptId: string }
  | { status: "signed_out" | "error" }
  | { status: "retake_not_ready"; nextAllowedAtMs: number };

export type DiagnosticAttemptSummary = {
  id: string;
  completedAt: string;
  scores: Record<string, number>;
};

const VALID_SECTIONS = new Set<string>(diagnosticSections.map((section) => section.id));
type DiagnosticRow = { section_id: string; score: number };
type AttemptRow = { id: string; completed_at: string };
type AttemptScoreRow = { attempt_id: string; section_id: string; score: number };

export function rowsToDiagnosticScores(rows: DiagnosticRow[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const row of rows) {
    if (!VALID_SECTIONS.has(row.section_id) || typeof row.score !== "number" || Number.isNaN(row.score)) continue;
    scores[row.section_id] = Math.min(1, Math.max(0, row.score));
  }
  return scores;
}

function sanitizeScores(scores: Record<string, number>): { section_id: string; score: number }[] {
  const out: { section_id: string; score: number }[] = [];
  for (const section of diagnosticSections) {
    const value = scores[section.id];
    if (typeof value !== "number" || Number.isNaN(value)) continue;
    out.push({ section_id: section.id, score: Math.min(1, Math.max(0, value)) });
  }
  return out;
}

export async function getDiagnosticScores(): Promise<Record<string, number>> {
  const supabase = await createClient();
  if (!supabase) return {};
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return {};

  const { data, error } = await supabase
    .from("diagnostic_scores")
    .select("section_id,score")
    .eq("user_id", auth.user.id);
  return error || !data ? {} : rowsToDiagnosticScores(data as DiagnosticRow[]);
}

export async function getDiagnosticHistory(limit = 10): Promise<DiagnosticAttemptSummary[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data: attempts, error } = await supabase
    .from("diagnostic_attempts")
    .select("id,completed_at")
    .eq("user_id", auth.user.id)
    .order("completed_at", { ascending: false })
    .limit(Math.min(25, Math.max(1, limit)));
  if (error || !attempts || attempts.length === 0) return [];

  const ids = (attempts as AttemptRow[]).map((attempt) => attempt.id);
  const { data: scoreRows, error: scoreError } = await supabase
    .from("diagnostic_attempt_scores")
    .select("attempt_id,section_id,score")
    .in("attempt_id", ids);
  if (scoreError || !scoreRows) return [];

  const byAttempt = new Map<string, DiagnosticRow[]>();
  for (const row of scoreRows as AttemptScoreRow[]) {
    const current = byAttempt.get(row.attempt_id) ?? [];
    current.push({ section_id: row.section_id, score: row.score });
    byAttempt.set(row.attempt_id, current);
  }

  return (attempts as AttemptRow[]).map((attempt) => ({
    id: attempt.id,
    completedAt: attempt.completed_at,
    scores: rowsToDiagnosticScores(byAttempt.get(attempt.id) ?? [])
  }));
}

export async function saveDiagnosticScores(
  scores: Record<string, number>,
  submissionId: string,
  nowMs = Date.now()
): Promise<DiagnosticWriteOutcome> {
  const clean = sanitizeScores(scores);
  if (clean.length !== diagnosticSections.length || !submissionId) return { status: "error" };

  const supabase = await createClient();
  if (!supabase) return { status: "signed_out" };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "signed_out" };

  const { data: replay } = await supabase
    .from("diagnostic_attempts")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("submission_id", submissionId)
    .maybeSingle<{ id: string }>();
  if (replay) return { status: "ok", attemptId: replay.id };

  const { data: latest } = await supabase
    .from("diagnostic_attempts")
    .select("completed_at")
    .eq("user_id", auth.user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ completed_at: string }>();
  const availability = diagnosticRetakeAvailability(latest ? Date.parse(latest.completed_at) : null, nowMs);
  if (!availability.allowed && availability.nextAllowedAtMs !== null) {
    return { status: "retake_not_ready", nextAllowedAtMs: availability.nextAllowedAtMs };
  }

  const { data: attempt, error: attemptError } = await supabase
    .from("diagnostic_attempts")
    .insert({ user_id: auth.user.id, submission_id: submissionId, completed_at: new Date(nowMs).toISOString() })
    .select("id")
    .single<{ id: string }>();
  if (attemptError || !attempt) return { status: "error" };

  const attemptScores = clean.map((score) => ({ ...score, attempt_id: attempt.id }));
  const { error: historyError } = await supabase.from("diagnostic_attempt_scores").insert(attemptScores);
  if (historyError) {
    await supabase.from("diagnostic_attempts").delete().eq("id", attempt.id);
    return { status: "error" };
  }

  const updatedAt = new Date(nowMs).toISOString();
  const latestRows = clean.map((score) => ({
    user_id: auth.user.id,
    section_id: score.section_id,
    score: score.score,
    updated_at: updatedAt
  }));
  const { error: latestError } = await supabase
    .from("diagnostic_scores")
    .upsert(latestRows, { onConflict: "user_id,section_id" });
  if (latestError) {
    await supabase.from("diagnostic_attempts").delete().eq("id", attempt.id);
    return { status: "error" };
  }

  return { status: "ok", attemptId: attempt.id };
}
