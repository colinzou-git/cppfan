"use server";

import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_DAILY_NEW_SKILLS_GOAL,
  DEFAULT_DAILY_REVIEW_MINUTES,
  DEFAULT_EXPERIENCE_LEVEL,
  EXPERIENCE_OPTIONS,
  INTERVIEW_CPP_STANDARD_OPTIONS,
  INTERVIEW_TARGET_OPTIONS,
  LEARNING_GOAL_OPTIONS,
  PLATFORM_OPTIONS,
  RECENT_INTERVIEW_PRACTICE_OPTIONS,
  type ExperienceLevel,
  type InterviewCppStandard,
  type InterviewTargetProfile,
  type LearningGoal,
  type PreferredPlatform,
  type RecentInterviewPractice
} from "./profile-constants";

const experienceValues = new Set<string>(EXPERIENCE_OPTIONS.map((option) => option.value));
const learningGoalValues = new Set<string>(LEARNING_GOAL_OPTIONS.map((option) => option.value));
const platformValues = new Set<string>(PLATFORM_OPTIONS.map((option) => option.value));
const interviewTargetValues = new Set<string>(INTERVIEW_TARGET_OPTIONS.map((option) => option.value));
const interviewCppStandardValues = new Set<string>(INTERVIEW_CPP_STANDARD_OPTIONS.map((option) => option.value));
const recentInterviewPracticeValues = new Set<string>(RECENT_INTERVIEW_PRACTICE_OPTIONS.map((option) => option.value));

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberInRange(formData: FormData, key: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(formData.get(key) ?? ""), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function selected<T extends string>(formData: FormData, key: string, allowed: Set<string>) {
  return formData.getAll(key).map(String).filter((value): value is T => allowed.has(value));
}

function optional<T extends string>(formData: FormData, key: string, allowed: Set<string>): T | null {
  const value = text(formData, key);
  return allowed.has(value) ? (value as T) : null;
}

function optionalDate(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? null : value;
}

function errorPath(mode: string, nextPath: string, message: string) {
  const route = mode === "profile" ? "/profile" : "/onboarding";
  return `${route}?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(message)}`;
}

export async function saveProfileAction(formData: FormData) {
  const mode = text(formData, "mode") === "profile" ? "profile" : "onboarding";
  const nextPath = getSafeNextPath(text(formData, "next") || "/dashboard");
  const supabase = await createClient();
  if (!supabase) redirect(errorPath(mode, nextPath, "Supabase is not configured yet."));

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) {
    redirect(`/login?next=${encodeURIComponent(mode === "profile" ? "/profile" : "/onboarding")}`);
  }

  const displayName = text(formData, "display_name").slice(0, 80);
  if (displayName.length < 2) {
    redirect(errorPath(mode, nextPath, "Please enter a display name with at least 2 characters."));
  }

  const experienceValue = text(formData, "experience_level");
  const experience = experienceValues.has(experienceValue)
    ? (experienceValue as ExperienceLevel)
    : DEFAULT_EXPERIENCE_LEVEL;
  const target = optional<InterviewTargetProfile>(formData, "interview_target_profile", interviewTargetValues);
  const standard = target
    ? optional<InterviewCppStandard>(formData, "preferred_interview_cpp_standard", interviewCppStandardValues)
    : null;
  const recentPractice = target
    ? optional<RecentInterviewPractice>(formData, "recent_interview_practice", recentInterviewPracticeValues)
    : null;

  const payload = {
    id: data.user.id,
    email: data.user.email ?? null,
    display_name: displayName,
    experience_level: experience,
    daily_new_skills_goal: numberInRange(formData, "daily_new_skills_goal", DEFAULT_DAILY_NEW_SKILLS_GOAL, 0, 10),
    daily_review_minutes: numberInRange(formData, "daily_review_minutes", DEFAULT_DAILY_REVIEW_MINUTES, 5, 120),
    learning_goals: selected<LearningGoal>(formData, "learning_goals", learningGoalValues),
    preferred_platforms: selected<PreferredPlatform>(formData, "preferred_platforms", platformValues),
    interview_target_profile: target,
    preferred_interview_cpp_standard: standard,
    interview_target_date: target ? optionalDate(formData, "interview_target_date") : null,
    recent_interview_practice: recentPractice,
    interview_target_updated_at: new Date().toISOString(),
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString()
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" }).select("id").single();
  if (error) redirect(errorPath(mode, nextPath, error.message));
  redirect(nextPath);
}
