// Server-only persistence for the learner's interview rubric self-scores (#179).
// One row per (user, criterion) for the self source; saving upserts each. Best
// effort and never throws on the read path: no-ops signed-out / unconfigured /
// pre-migration. The pure row->score mapper is exported for unit tests. Peer and
// automated sources are reserved by the table and not written here.
import { createClient } from "@/lib/supabase/server";
import { RUBRIC_CRITERIA, type RubricCriterionId, type RubricScore } from "./rubric";

export type RubricWriteOutcome = "ok" | "signed_out" | "error";

const VALID_CRITERIA = new Set<string>(RUBRIC_CRITERIA.map((c) => c.id));

type RubricRow = { criterion: string; score: number };

/** Coerce stored rows into valid self RubricScores (whitelists/clamps defensively). */
export function rowsToSelfScores(rows: RubricRow[]): RubricScore[] {
  const scores: RubricScore[] = [];
  for (const row of rows) {
    if (!VALID_CRITERIA.has(row.criterion)) {
      continue;
    }
    scores.push({
      criterion: row.criterion as RubricCriterionId,
      score: Math.min(4, Math.max(0, Math.trunc(row.score))),
      source: "self"
    });
  }
  return scores;
}

/** Keep only valid self scores, last write per criterion wins, clamped to 0-4. */
function sanitizeSelfScores(scores: RubricScore[]): { criterion: RubricCriterionId; score: number }[] {
  const byCriterion = new Map<RubricCriterionId, number>();
  for (const s of scores) {
    if (!VALID_CRITERIA.has(s.criterion) || typeof s.score !== "number" || Number.isNaN(s.score)) {
      continue;
    }
    byCriterion.set(s.criterion, Math.min(4, Math.max(0, Math.trunc(s.score))));
  }
  return [...byCriterion].map(([criterion, score]) => ({ criterion, score }));
}

/** The signed-in learner's self rubric scores, or [] (signed out / none / error). */
export async function getSelfRubricScores(): Promise<RubricScore[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("rubric_scores")
    .select("criterion,score")
    .eq("user_id", user.id)
    .eq("source", "self");
  if (error || !data) {
    return [];
  }
  return rowsToSelfScores(data as RubricRow[]);
}

/** Upsert the learner's self rubric scores on (user_id, criterion, source). */
export async function saveSelfRubricScores(scores: RubricScore[]): Promise<RubricWriteOutcome> {
  const clean = sanitizeSelfScores(scores);
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
  const rows = clean.map((s) => ({
    user_id: user.id,
    criterion: s.criterion,
    source: "self",
    score: s.score,
    updated_at: now
  }));
  const { error } = await supabase.from("rubric_scores").upsert(rows, { onConflict: "user_id,criterion,source" });
  return error ? "error" : "ok";
}
