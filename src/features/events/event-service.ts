// Server-only: uses the Supabase server client (next/headers cookies).
import { createClient } from "@/lib/supabase/server";
import type { SkillEventName } from "./event-names";

export type RecordSkillEventInput = {
  eventType: SkillEventName;
  skillId?: string | null;
  learningItemId?: string | null;
  reviewCardId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Append a skill event for the signed-in learner. Best effort and never throws:
 * returns false when Supabase is unconfigured, the learner is signed out, or the
 * ledger is not migrated yet, so callers can fire-and-forget without affecting
 * their primary flow.
 */
export async function recordSkillEvent(input: RecordSkillEventInput): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const { error } = await supabase.from("skill_events").insert({
    user_id: user.id,
    skill_id: input.skillId ?? null,
    learning_item_id: input.learningItemId ?? null,
    review_card_id: input.reviewCardId ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {}
  });

  return !error;
}

/**
 * Append several skill events for the signed-in learner in one insert. Same
 * best-effort contract as recordSkillEvent.
 */
export async function recordSkillEvents(inputs: RecordSkillEventInput[]): Promise<boolean> {
  if (inputs.length === 0) {
    return false;
  }

  const supabase = await createClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const rows = inputs.map((input) => ({
    user_id: user.id,
    skill_id: input.skillId ?? null,
    learning_item_id: input.learningItemId ?? null,
    review_card_id: input.reviewCardId ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {}
  }));

  const { error } = await supabase.from("skill_events").insert(rows);
  return !error;
}
