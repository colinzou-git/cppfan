import { createClient } from "@/lib/supabase/server";
import { logConfiguredFailure } from "@/lib/supabase/errors";
import { skillSeed } from "@/features/skills/skill-seed";
import { RECENCY_WINDOW_DAYS, scoreSkillFromEvents } from "./mastery-scoring";
import { getCoverageForSkill } from "./context-coverage";
import { adjustMasteryForContextCoverage } from "./context-coverage-rules";
import { explainContextCoverageStatus } from "./context-coverage-explanations";
import { emptyStatusCounts, type MasterySummary, type SkillMastery, type SkillStatus } from "./mastery-types";
import type { ScoringEvent } from "@/features/events/event-types";

// Surfacing order: things needing attention first, mastered last.
const STATUS_PRIORITY: Record<SkillStatus, number> = {
  regressed: 0,
  weak: 1,
  reviewing: 2,
  learning: 3,
  strong: 4,
  mastered: 5,
  new: 6
};

/**
 * Aggregate the signed-in learner's skill events into per-skill mastery using
 * the rule-based scorer. Returns an unauthenticated summary when Supabase is
 * unconfigured, the learner is signed out, or the ledger is not migrated yet.
 */
export async function getMasterySummary(): Promise<MasterySummary> {
  const supabase = await createClient();
  if (!supabase) {
    return { authenticated: false, skills: [], counts: emptyStatusCounts() };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { authenticated: false, skills: [], counts: emptyStatusCounts() };
  }

  // Bound the work (#144): only load evidence within the recency window the
  // scorer actually uses, instead of the learner's entire event history.
  const now = new Date();
  const since = new Date(now.getTime() - RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const { data, error } = await supabase
    .from("skill_events")
    .select("skill_id,event_type,event_time,metadata")
    .eq("user_id", user.id)
    .not("skill_id", "is", null)
    .gte("event_time", since)
    .order("event_time", { ascending: true });

  if (error) {
    // Empty summary is acceptable degraded UI, but log a configured failure so
    // a backend outage/permission regression is observable, not silent (#146).
    logConfiguredFailure("mastery", error);
    return { authenticated: true, skills: [], counts: emptyStatusCounts() };
  }

  const titleById = new Map(skillSeed.map((skill) => [skill.id, skill.title]));
  const bySkill = new Map<string, ScoringEvent[]>();

  for (const row of data ?? []) {
    const skillId = row.skill_id as string | null;
    if (!skillId) {
      continue;
    }
    const list = bySkill.get(skillId) ?? [];
    list.push({
      event_type: row.event_type,
      event_time: row.event_time,
      metadata: (row.metadata as Record<string, unknown> | null) ?? null
    });
    bySkill.set(skillId, list);
  }

  const counts = emptyStatusCounts();
  const skills: SkillMastery[] = [];

  for (const [skillId, events] of bySkill) {
    const score = scoreSkillFromEvents(events, nowIso);
    // #417: hold a premature `mastered` at `strong` until multi-context evidence
    // exists. Only `mastered` is adjusted; the reason is updated to explain why.
    const coverage = getCoverageForSkill({ skillId, events });
    const status = adjustMasteryForContextCoverage({
      skillId,
      currentStatus: score.status,
      coverage
    });
    const reason =
      status !== score.status ? explainContextCoverageStatus(coverage) : score.reason;
    counts[status] += 1;
    skills.push({
      skillId,
      title: titleById.get(skillId) ?? skillId,
      status,
      score: score.score,
      reason
    });
  }

  skills.sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || a.title.localeCompare(b.title)
  );

  return { authenticated: true, skills, counts };
}
