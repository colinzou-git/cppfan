"use server";

import { redirect } from "next/navigation";
import {
  INTERVIEW_CPP_STANDARDS,
  INTERVIEW_TARGET_PROFILES,
  RECENT_INTERVIEW_PRACTICE,
  type InterviewCppStandard,
  type InterviewTargetProfileId,
  type RecentInterviewPractice
} from "./target-profile";
import { resetInterviewTarget, saveInterviewTarget } from "./target-profile-store";

const targetIds = new Set<string>(INTERVIEW_TARGET_PROFILES.map((item) => item.id));
const standardIds = new Set<string>(INTERVIEW_CPP_STANDARDS.map((item) => item.id));
const recentIds = new Set<string>(RECENT_INTERVIEW_PRACTICE.map((item) => item.id));

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalDate(formData: FormData): string | null {
  const date = value(formData, "target_date");
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
    return null;
  }
  return date;
}

export async function saveInterviewTargetAction(formData: FormData) {
  const targetProfile = value(formData, "target_profile");
  const cppStandard = value(formData, "cpp_standard");
  const recentPractice = value(formData, "recent_practice");

  if (!targetIds.has(targetProfile) || !standardIds.has(cppStandard) || !recentIds.has(recentPractice)) {
    redirect("/interview/target?error=invalid-settings");
  }

  const result = await saveInterviewTarget({
    targetProfile: targetProfile as InterviewTargetProfileId,
    cppStandard: cppStandard as InterviewCppStandard,
    targetDate: optionalDate(formData),
    recentPractice: recentPractice as RecentInterviewPractice
  });

  redirect(result.ok ? "/interview/target?saved=1" : `/interview/target?error=${encodeURIComponent(result.error)}`);
}

export async function resetInterviewTargetAction() {
  const result = await resetInterviewTarget();
  redirect(result.ok ? "/interview/target?reset=1" : `/interview/target?error=${encodeURIComponent(result.error)}`);
}
