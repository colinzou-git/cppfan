// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { getChoicesForItem } from "./learning-item-seed";
import type { GradingChoice } from "./grading";

/**
 * Choices including the answer key, read server-side only for grading. Falls
 * back to the bundled seed when Supabase is unconfigured or the migration is
 * not applied. Never expose the result directly to the client.
 */
export async function getGradingChoices(itemId: string): Promise<GradingChoice[]> {
  const supabase = await createClient();

  if (!supabase) {
    return getChoicesForItem(itemId);
  }

  const { data, error } = await supabase
    .from("learning_item_choices")
    .select("id,is_correct,order_index")
    .eq("learning_item_id", itemId)
    .order("order_index", { ascending: true });

  if (error || !data || data.length === 0) {
    return getChoicesForItem(itemId);
  }

  return data as GradingChoice[];
}

/**
 * Record an attempt for the signed-in learner. Best effort: returns false when
 * Supabase is unconfigured, the user is not signed in, or the attempts table is
 * not yet migrated, so grading still works offline / pre-migration.
 */
export async function recordAttempt(input: {
  itemId: string;
  choiceId: string;
  isCorrect: boolean;
}): Promise<boolean> {
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

  const { error } = await supabase.from("learning_item_attempts").insert({
    user_id: user.id,
    learning_item_id: input.itemId,
    selected_choice_id: input.choiceId,
    is_correct: input.isCorrect
  });

  return !error;
}
