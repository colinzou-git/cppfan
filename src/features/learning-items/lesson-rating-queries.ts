import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import type { LessonRatingState } from "./lesson-rating-types";

export async function getLessonRatingState(itemId: string): Promise<LessonRatingState> {
  const supabase = await createClient();
  if (!supabase) {
    return { state: "unavailable" };
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    logConfiguredFailure("lesson-rating-auth", authError);
    return { state: "unavailable" };
  }
  if (!auth.user) {
    return { state: "signed_out" };
  }

  const result = await supabase
    .from("review_cards")
    .select("id,due_at,reps")
    .eq("user_id", auth.user.id)
    .eq("learning_item_id", itemId)
    .maybeSingle();

  if (result.error) {
    if (!isMissingObjectError(result.error)) {
      logConfiguredFailure("lesson-rating-state", result.error);
    }
    return { state: "unavailable" };
  }

  if (!result.data) {
    return { state: "unrated" };
  }

  return {
    state: "scheduled",
    cardId: String(result.data.id),
    dueAt: String(result.data.due_at),
    reps: Number(result.data.reps)
  };
}
