import type { ExperienceLevel, LearningGoal, PreferredPlatform } from "./profile-constants";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string;
  experience_level: ExperienceLevel;
  daily_new_skills_goal: number;
  daily_review_minutes: number;
  learning_goals: LearningGoal[];
  preferred_platforms: PreferredPlatform[];
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
