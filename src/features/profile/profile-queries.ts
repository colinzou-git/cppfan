import { createClient } from "@/lib/supabase/server";
import { logConfiguredFailure } from "@/lib/supabase/errors";
import type { Profile } from "./profile-types";

export async function getProfileForUser(userId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,email,display_name,experience_level,daily_new_skills_goal,daily_review_minutes,learning_goals,preferred_platforms,onboarding_completed,onboarding_completed_at,created_at,updated_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // Surface a configured backend failure instead of silently returning null,
    // which the caller would otherwise treat as "no profile" (#146).
    logConfiguredFailure("profile", error);
    return null;
  }

  return data as Profile | null;
}
