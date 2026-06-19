"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skillSeed } from "@/features/skills/skill-seed";
import {
  cancelStudyGoal,
  completeStudyGoal,
  createStudyGoal,
  reopenStudyGoal,
  reviseStudyGoal
} from "@/features/goals/goal-store";
import type { StudyGoalRevisionInput } from "@/features/goals/goal-contract";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function revisionInput(formData: FormData): StudyGoalRevisionInput {
  const skillIds = [...new Set(formData.getAll("skill_ids").map(String))];
  const skills = skillIds
    .map((id) => skillSeed.find((skill) => skill.id === id && skill.is_active))
    .filter((skill): skill is (typeof skillSeed)[number] => Boolean(skill));

  return {
    title: value(formData, "title"),
    startLocalDate: value(formData, "start_local_date"),
    endLocalDate: value(formData, "end_local_date"),
    timezone: value(formData, "timezone"),
    recommendationSource: "manual",
    recommendationReason: value(formData, "recommendation_reason") || undefined,
    learnerNote: value(formData, "learner_note") || undefined,
    targets: skills.map((skill, index) => ({
      targetKind: "acquire_skill",
      referenceId: skill.id,
      titleSnapshot: skill.title,
      acquisitionContractId: "skill-initial-learning",
      acquisitionContractVersion: 1,
      source: "manual",
      orderIndex: index
    }))
  };
}

function finish(result: { status: string }) {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect(`/goals?result=${encodeURIComponent(result.status)}`);
}

export async function createGoalAction(formData: FormData) {
  finish(await createStudyGoal(crypto.randomUUID(), revisionInput(formData)));
}

export async function reviseGoalAction(formData: FormData) {
  finish(await reviseStudyGoal(
    value(formData, "goal_id"),
    Number(value(formData, "expected_revision")),
    crypto.randomUUID(),
    revisionInput(formData)
  ));
}

export async function cancelGoalAction(formData: FormData) {
  finish(await cancelStudyGoal(
    value(formData, "goal_id"),
    Number(value(formData, "expected_revision")),
    crypto.randomUUID(),
    value(formData, "reason") || undefined
  ));
}

export async function completeGoalAction(formData: FormData) {
  finish(await completeStudyGoal(
    value(formData, "goal_id"),
    Number(value(formData, "expected_revision")),
    crypto.randomUUID(),
    value(formData, "reason") || undefined
  ));
}

export async function reopenGoalAction(formData: FormData) {
  finish(await reopenStudyGoal(
    value(formData, "goal_id"),
    Number(value(formData, "expected_revision")),
    crypto.randomUUID(),
    value(formData, "reason") || undefined
  ));
}
