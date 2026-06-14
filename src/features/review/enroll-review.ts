// Server-only helper (not a "use server" action): enroll the signed-in learner's
// review card for an item from learning evidence. Shared by the attempt boundary
// (a graded practice attempt) and the deliberate "add to review" action (#142).
import { createClient } from "@/lib/supabase/server";
import { enrollReviewCard } from "./review-queries";

/**
 * Enroll a review card for the signed-in learner from real evidence. Best effort
 * and never throws: no-ops when Supabase is unconfigured, the learner is signed
 * out, the item is not retrieval-practice eligible, or the table is not migrated.
 * Idempotent (see enrollReviewCard).
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

  return enrollReviewCard(supabase, user.id, itemId);
}
