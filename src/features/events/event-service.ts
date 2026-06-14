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
 * Shape each event takes when handed to the trusted `record_skill_events`
 * function. user_id is NOT included — the function stamps it from auth.uid().
 */
function toEventPayload(input: RecordSkillEventInput): Record<string, unknown> {
  return {
    skill_id: input.skillId ?? null,
    learning_item_id: input.learningItemId ?? null,
    review_card_id: input.reviewCardId ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {}
  };
}

/**
 * Append a skill event for the signed-in learner. Best effort and never throws:
 * returns false when Supabase is unconfigured, the learner is signed out, or the
 * ledger is not migrated yet, so callers can fire-and-forget without affecting
 * their primary flow.
 */
export async function recordSkillEvent(input: RecordSkillEventInput): Promise<boolean> {
  return recordSkillEvents([input]);
}

/**
 * Append several skill events for the signed-in learner through the
 * server-authoritative `record_skill_events` function (#141), which stamps
 * user_id from auth.uid() and validates any referenced review card. Direct
 * client INSERT on skill_events is revoked, so mastery-bearing events
 * (skill_mastered / quiz_correct / code_passed / ...) cannot be forged from the
 * browser. Same best-effort contract as before.
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

  const { error } = await supabase.rpc("record_skill_events", {
    p_events: inputs.map(toEventPayload)
  });

  return !error;
}
