"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skillSeed } from "@/features/skills/skill-seed";
import { cancelStudyGoal, createStudyGoal } from "@/features/goals/goal-store";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function createGoalAction(formData: FormData) {
  const skillIds = [...new Set(formData.getAll("skill_ids").map(String))];
  const skills = skillIds
    .map((id) => skillSeed.find((skill) => skill.id === id && skill.is_active))
    .filter((skill): skill is (typeof skillSeed)[number] => Boolean(skill));

  const result = await createStudyGoal(crypto.randomUUID(), {
    title: value(formData, "title"),
    startLocalDate: value(formData, "start_local_date"),
    endLocalDate: value(formData, "end_local_date"),
    timezone: value(formData, "timezone"),
    recommendationSource: "manual",
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
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect(`/goals?result=${encodeURIComponent(result.status)}`);
}

export async function cancelGoalAction(formData: FormData) {
  const result = await cancelStudyGoal(
    value(formData, "goal_id"),
    Number(value(formData, "expected_revision")),
    crypto.randomUUID(),
    value(formData, "reason") || undefined
  );
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect(`/goals?result=${encodeURIComponent(result.status)}`);
}
