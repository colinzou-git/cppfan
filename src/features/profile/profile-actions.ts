"use server";

import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_DAILY_NEW_SKILLS_GOAL,
  DEFAULT_DAILY_REVIEW_MINUTES,
  DEFAULT_EXPERIENCE_LEVEL,
  EXPERIENCE_OPTIONS,
  LEARNING_GOAL_OPTIONS,
  PLATFORM_OPTIONS,
  type ExperienceLevel,
  type LearningGoal,
  type PreferredPlatform
} from "./profile-constants";

const experienceValues = new Set<string>(EXPERIENCE_OPTIONS.map((option) => option.value));
const learningGoalValues = new Set<string>(LEARNING_GOAL_OPTIONS.map((option) => option.value));
const platformValues = new Set<string>(PLATFORM_OPTIONS.map((option) => option.value));

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumberInRange(formData: FormData, key: string, fallback: number, min: number, max: number) {
  const raw = Number.parseInt(String(formData.get(key) ?? ""), 10);

  if (!Number.isFinite(raw)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, raw));
}

function getSelectedValues<T extends string>(formData: FormData, key: string, allowedValues: Set<string>) {
  return formData
    .getAll(key)
    .map((value) => String(value))
    .filter((value): value is T => allowedValues.has(value));
}

function getExperienceLevel(formData: FormData) {
  const value = getTrimmedString(formData, "experience_level");

  if (experienceValues.has(value)) {
    return value as ExperienceLevel;
  }

  return DEFAULT_EXPERIENCE_LEVEL;
}

function getErrorRedirect(mode: string, nextPath: string, message: string) {
  const route = mode === "profile" ? "/profile" : "/onboarding";
  return `${route}?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(message)}`;
}

export async function saveProfileAction(formData: FormData) {
  const mode = getTrimmedString(formData, "mode") === "profile" ? "profile" : "onboarding";
  const nextPath = getSafeNextPath(getTrimmedString(formData, "next") || "/dashboard");
  const supabase = await createClient();

  if (!supabase) {
    redirect(getErrorRedirect(mode, nextPath, "Supabase is not configured yet."));
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?next=${encodeURIComponent(mode === "profile" ? "/profile" : "/onboarding")}`);
  }

  const displayName = getTrimmedString(formData, "display_name").slice(0, 80);

  if (displayName.length < 2) {
    redirect(getErrorRedirect(mode, nextPath, "Please enter a display name with at least 2 characters."));
  }

  const payload = {
    id: user.id,
    email: user.email ?? null,
    display_name: displayName,
    experience_level: getExperienceLevel(formData),
    daily_new_skills_goal: getNumberInRange(
      formData,
      "daily_new_skills_goal",
      DEFAULT_DAILY_NEW_SKILLS_GOAL,
      0,
      10
    ),
    daily_review_minutes: getNumberInRange(
      formData,
      "daily_review_minutes",
      DEFAULT_DAILY_REVIEW_MINUTES,
      5,
      120
    ),
    learning_goals: getSelectedValues<LearningGoal>(formData, "learning_goals", learningGoalValues),
    preferred_platforms: getSelectedValues<PreferredPlatform>(formData, "preferred_platforms", platformValues),
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString()
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" }).select("id").single();

  if (error) {
    redirect(getErrorRedirect(mode, nextPath, error.message));
  }

  redirect(nextPath);
}
