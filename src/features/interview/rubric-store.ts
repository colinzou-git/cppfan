// Server-only persistence for learner interview rubric scores (#179).
// Scores stay source-separated: self, peer, and automated evidence are never
// merged at write time. Read paths are best effort and return [] when signed out,
// unconfigured, or pre-migration.
import { createClient } from "@/lib/supabase/server";
import { RUBRIC_CRITERIA, type FeedbackSource, type RubricCriterionId, type RubricScore } from "./rubric";

export type RubricWriteOutcome = "ok" | "signed_out" | "error";

const VALID_CRITERIA = new Set<string>(RUBRIC_CRITERIA.map((c) => c.id));
const VALID_SOURCES: FeedbackSource[] = ["self", "peer", "automated"];

type RubricRow = { criterion: string; score: number; source?: string | null };

/** Coerce stored rows into valid RubricScores (whitelists/clamps defensively). */
export function rowsToRubricScores(rows: RubricRow[], fallbackSource: FeedbackSource = "self"): RubricScore[] {
  const scores: RubricScore[] = [];
  for (const row of rows) {
    if (!VALID_CRITERIA.has(row.criterion)) {
      continue;
    }
    const source = VALID_SOURCES.includes(row.source as FeedbackSource) ? (row.source as FeedbackSource) : fallbackSource;
    scores.push({
      criterion: row.criterion as RubricCriterionId,
      score: Math.min(4, Math.max(0, Math.trunc(row.score))),
      source
    });
  }
  return scores;
}

/** Backward-compatible self-score mapper used by existing readiness tests. */
export function rowsToSelfScores(rows: RubricRow[]): RubricScore[] {
  return rowsToRubricScores(rows, "self").map((score) => ({ ...score, source: "self" }));
}

/** Keep only valid scores for one source, last write per criterion wins, clamped to 0-4. */
function sanitizeScores(scores: RubricScore[], source: FeedbackSource): { criterion: RubricCriterionId; score: number }[] {
  const byCriterion = new Map<RubricCriterionId, number>();
  for (const s of scores) {
    if (s.source !== source || !VALID_CRITERIA.has(s.criterion) || typeof s.score !== "number" || Number.isNaN(s.score)) {
      continue;
    }
    byCriterion.set(s.criterion, Math.min(4, Math.max(0, Math.trunc(s.score))));
  }
  return [...byCriterion].map(([criterion, score]) => ({ criterion, score }));
}

async function currentUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** The signed-in learner's scores from one rubric source, or [] on no data/error. */
export async function getRubricScoresBySource(source: FeedbackSource): Promise<RubricScore[]> {
  const { supabase, user } = await currentUser();
  if (!supabase || !user || !VALID_SOURCES.includes(source)) return [];
  const { data, error } = await supabase
    .from("rubric_scores")
    .select("criterion,score,source")
    .eq("user_id", user.id)
    .eq("source", source);
  if (error || !data) return [];
  return rowsToRubricScores(data as RubricRow[], source).filter((score) => score.source === source);
}

/** The signed-in learner's source-separated rubric scores, or [] on no data/error. */
export async function getAllRubricScores(): Promise<RubricScore[]> {
  const { supabase, user } = await currentUser();
  if (!supabase || !user) return [];
  const { data, error } = await supabase
    .from("rubric_scores")
    .select("criterion,score,source")
    .eq("user_id", user.id);
  if (error || !data) return [];
  return rowsToRubricScores(data as RubricRow[]);
}

/** The signed-in learner's self rubric scores, or [] (signed out / none / error). */
export async function getSelfRubricScores(): Promise<RubricScore[]> {
  return getRubricScoresBySource("self");
}

async function saveRubricScoresForSource(scores: RubricScore[], source: FeedbackSource): Promise<RubricWriteOutcome> {
  const clean = sanitizeScores(scores, source);
  if (clean.length === 0) return "ok";
  const { supabase, user } = await currentUser();
  if (!supabase) return "signed_out";
  if (!user) return "signed_out";
  const now = new Date().toISOString();
  const rows = clean.map((s) => ({
    user_id: user.id,
    criterion: s.criterion,
    source,
    score: s.score,
    updated_at: now
  }));
  const { error } = await supabase.from("rubric_scores").upsert(rows, { onConflict: "user_id,criterion,source" });
  return error ? "error" : "ok";
}

/** Upsert the learner's self rubric scores on (user_id, criterion, source). */
export async function saveSelfRubricScores(scores: RubricScore[]): Promise<RubricWriteOutcome> {
  return saveRubricScoresForSource(scores, "self");
}

/** Upsert peer rubric scores. Intended for shared/review workflows, never mixed with self scores. */
export async function savePeerRubricScores(scores: RubricScore[]): Promise<RubricWriteOutcome> {
  return saveRubricScoresForSource(scores, "peer");
}

/** Upsert automated rubric scores derived from judge/session evidence. */
export async function saveAutomatedRubricScores(scores: RubricScore[]): Promise<RubricWriteOutcome> {
  return saveRubricScoresForSource(scores, "automated");
}
