// Server-only helper (not a "use server" action): enroll the signed-in learner's
// review card for an item from learning evidence. Used by the deliberate "add to
// review" action (#142). Enrollment goes through the trusted enroll_review_card
// RPC (#218) — direct client INSERT on review_cards is revoked — which derives
// eligibility and the primary skill from database-owned curriculum.
import { createClient } from "@/lib/supabase/server";

/**
 * Enroll a review card for the signed-in learner from real evidence. Best effort
 * and never throws: no-ops when Supabase is unconfigured, the learner is signed
 * out, the item is not retrieval-practice eligible, or the function is not
 * migrated. Idempotent (the RPC upserts on user+item). Returns whether a card now
 * exists for the item.
 */
export async function enrollReviewForUser(itemId: string): Promise<boolean> {
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

  const { data, error } = await supabase.rpc("enroll_review_card", { p_item_id: itemId });
  if (error) {
    return false;
  }
  return Boolean(data);
}
