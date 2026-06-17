// Server-only persistence for the learner's baseline diagnostic scores (#175/#182).
// One row per (user, section); saving upserts each. Best effort on the read path:
// no-ops signed-out / unconfigured / pre-migration. The pure row->scores mapper is
// exported for unit tests. Scores are clamped to [0,1] and section ids whitelisted
// against the diagnostic definition.
import { createClient } from "@/lib/supabase/server";
import { diagnosticSections } from "./diagnostic";

export type DiagnosticWriteOutcome = "ok" | "signed_out" | "error";

const VALID_SECTIONS = new Set<string>(diagnosticSections.map((s) => s.id));

type DiagnosticRow = { section_id: string; score: number };

/** Coerce stored rows into a sectionId->score map (whitelists/clamps defensively). */
export function rowsToDiagnosticScores(rows: DiagnosticRow[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const row of rows) {
    if (!VALID_SECTIONS.has(row.section_id) || typeof row.score !== "number" || Number.isNaN(row.score)) {
      continue;
    }
    scores[row.section_id] = Math.min(1, Math.max(0, row.score));
  }
  return scores;
}

/** Keep only valid sections, last write per section wins, clamped to [0,1]. */
function sanitizeScores(scores: Record<string, number>): { section_id: string; score: number }[] {
  const out: { section_id: string; score: number }[] = [];
  for (const [section, value] of Object.entries(scores)) {
    if (!VALID_SECTIONS.has(section) || typeof value !== "number" || Number.isNaN(value)) {
      continue;
    }
    out.push({ section_id: section, score: Math.min(1, Math.max(0, value)) });
  }
  return out;
}

/** The signed-in learner's diagnostic scores (sectionId->score), or {} otherwise. */
export async function getDiagnosticScores(): Promise<Record<string, number>> {
  const supabase = await createClient();
  if (!supabase) {
    return {};
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return {};
  }
  const { data, error } = await supabase
    .from("diagnostic_scores")
    .select("section_id,score")
    .eq("user_id", user.id);
  if (error || !data) {
    return {};
  }
  return rowsToDiagnosticScores(data as DiagnosticRow[]);
}

/** Upsert the learner's diagnostic scores on (user_id, section_id). */
export async function saveDiagnosticScores(scores: Record<string, number>): Promise<DiagnosticWriteOutcome> {
  const clean = sanitizeScores(scores);
  if (clean.length === 0) {
    return "ok";
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
  const now = new Date().toISOString();
  const rows = clean.map((s) => ({ user_id: user.id, section_id: s.section_id, score: s.score, updated_at: now }));
  const { error } = await supabase.from("diagnostic_scores").upsert(rows, { onConflict: "user_id,section_id" });
  return error ? "error" : "ok";
}
