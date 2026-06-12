import { createClient } from "@/lib/supabase/server";
import { skillSeed } from "@/features/skills/skill-seed";
import { scoreSkillFromEvents } from "./mastery-scoring";
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

  const { data, error } = await supabase
    .from("skill_events")
    .select("skill_id,event_type,event_time")
    .eq("user_id", user.id)
    .not("skill_id", "is", null)
    .order("event_time", { ascending: true });

  if (error) {
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
    list.push({ event_type: row.event_type, event_time: row.event_time });
    bySkill.set(skillId, list);
  }

  const counts = emptyStatusCounts();
  const skills: SkillMastery[] = [];

  for (const [skillId, events] of bySkill) {
    const score = scoreSkillFromEvents(events);
    counts[score.status] += 1;
    skills.push({
      skillId,
      title: titleById.get(skillId) ?? skillId,
      status: score.status,
      score: score.score,
      reason: score.reason
    });
  }

  skills.sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || a.title.localeCompare(b.title)
  );

  return { authenticated: true, skills, counts };
}
