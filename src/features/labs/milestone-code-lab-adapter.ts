import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import type { CapstoneMilestone } from "./capstone-tracks";

/**
 * Bridges capstone milestones to the Code Lab (#418). The runnable Code Lab
 * config lives in the code-lab catalog keyed by the milestone id, so the existing
 * /api/code/* routes work unchanged. Single-file beginner/DSA milestones only;
 * larger work stays in Codespaces.
 */

export function milestoneToCodeLabConfig(milestone: CapstoneMilestone): LearningItemCodeLab | null {
  if (milestone.executionMode !== "in_app_code_lab") return null;
  return getCodeLabConfigForItem(milestone.id);
}

export function canRunMilestoneInApp(milestone: CapstoneMilestone): boolean {
  return milestoneToCodeLabConfig(milestone) !== null;
}

export function getMilestoneExecutionLabel(milestone: CapstoneMilestone): string {
  switch (milestone.executionMode) {
    case "in_app_code_lab":
      return "In-app Code Lab";
    case "codespaces":
      return "External Codespaces";
    case "reflection_only":
      return "Reflection only";
    default:
      return "Manual / external";
  }
}
