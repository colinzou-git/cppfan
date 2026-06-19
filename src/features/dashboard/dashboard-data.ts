import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/features/profile/profile-queries";
import { getSkillMapPreview } from "@/features/skills/skill-queries";
import { getItemLinksBySkill } from "@/features/learning-items/learning-item-queries";
import { getMasterySummary } from "@/features/mastery/mastery-queries";
import { getStudyGoalReadModel } from "@/features/goals/goal-queries";
import { getDailyNewPlanForGoals } from "@/features/goals/daily-new-queries";
import { getDailyReviewView } from "@/features/review/daily-review-queries";

export async function getDashboardData() {
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  let account: { email: string; name: string | null; newSkills: number; reviewMinutes: number } | null = null;

  if (configured && supabase) {
    const { data: auth, error } = await supabase.auth.getUser();
    if (error || !auth.user) redirect("/login?next=/dashboard");
    const profile = await getProfileForUser(auth.user.id);
    if (!profile?.onboarding_completed) redirect("/onboarding?next=/dashboard");
    account = {
      email: auth.user.email ?? auth.user.user_metadata?.email ?? "Signed-in learner",
      name: profile.display_name,
      newSkills: profile.daily_new_skills_goal,
      reviewMinutes: profile.daily_review_minutes
    };
  }

  const [skillMap, itemLinks, mastery, goals] = await Promise.all([
    getSkillMapPreview(),
    getItemLinksBySkill(),
    getMasterySummary(),
    getStudyGoalReadModel()
  ]);
  const [dailyNew, dailyReview] = await Promise.all([
    getDailyNewPlanForGoals(goals),
    getDailyReviewView(goals.active[0]?.timezone ?? "UTC")
  ]);
  return { configured, account, skillMap, itemLinks, mastery, goals, dailyNew, dailyReview };
}
