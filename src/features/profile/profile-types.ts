import type {
  ExperienceLevel,
  InterviewCppStandard,
  InterviewTargetProfile,
  LearningGoal,
  PreferredPlatform,
  RecentInterviewPractice
} from "./profile-constants";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string;
  experience_level: ExperienceLevel;
  daily_new_skills_goal: number;
  daily_review_minutes: number;
  learning_goals: LearningGoal[];
  preferred_platforms: PreferredPlatform[];
  interview_target_profile: InterviewTargetProfile | null;
  preferred_interview_cpp_standard: InterviewCppStandard | null;
  interview_target_date: string | null;
  recent_interview_practice: RecentInterviewPractice | null;
  interview_target_updated_at: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
