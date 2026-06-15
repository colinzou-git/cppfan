// Server-only: append error-pattern evidence events (#126). After a graded
// submission, look at the learner's recent wrong answers per misconception tag and
// the tags already in an "observed" state, then record error_pattern_observed /
// error_pattern_cleared transitions in skill_events (separate from FSRS). Best
// effort and never throws — derived evidence must not affect the primary submit.
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordSkillEvents } from "@/features/events/event-service";
import { getErrorTagForChoice, type InstructionalTag } from "./error-tags";
import { decideErrorPatternEvents } from "./error-pattern-events";

const WINDOW_DAYS = 14;

/** Tags currently in the "observed" state: most recent transition was observed. */
function observedTagsFromEvents(
  rows: { event_type: string; metadata: unknown }[]
): InstructionalTag[] {
  // rows are newest-first; the first event seen per tag is its current state.
  const seen = new Set<string>();
  const observed: InstructionalTag[] = [];
  for (const row of rows) {
    const tag = (row.metadata as { tag?: unknown } | null)?.tag;
    if (typeof tag !== "string" || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    if (row.event_type === "error_pattern_observed") {
      observed.push(tag as InstructionalTag);
    }
  }
  return observed;
}

export async function recordErrorPatternTransitions(supabase: SupabaseClient, userId: string): Promise<void> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const wrong = await supabase
    .from("learning_item_attempts")
    .select("selected_choice_id")
    .eq("user_id", userId)
    .eq("is_correct", false)
    .gte("created_at", since)
    .limit(500);
  if (wrong.error) {
    return;
  }
  const wrongByTag: Partial<Record<InstructionalTag, number>> = {};
  for (const row of wrong.data ?? []) {
    const tag = typeof row.selected_choice_id === "string" ? getErrorTagForChoice(row.selected_choice_id) : null;
    if (tag) {
      wrongByTag[tag] = (wrongByTag[tag] ?? 0) + 1;
    }
  }

  const events = await supabase
    .from("skill_events")
    .select("event_type,metadata")
    .eq("user_id", userId)
    .in("event_type", ["error_pattern_observed", "error_pattern_cleared"])
    .gte("event_time", since)
    .order("event_time", { ascending: false })
    .limit(200);
  if (events.error) {
    return;
  }

  const { observe, clear } = decideErrorPatternEvents({
    wrongByTag,
    observedTags: observedTagsFromEvents(events.data ?? [])
  });

  const toRecord = [
    ...observe.map((tag) => ({ eventType: "error_pattern_observed" as const, metadata: { tag } })),
    ...clear.map((tag) => ({ eventType: "error_pattern_cleared" as const, metadata: { tag } }))
  ];
  if (toRecord.length > 0) {
    await recordSkillEvents(toRecord);
  }
}
