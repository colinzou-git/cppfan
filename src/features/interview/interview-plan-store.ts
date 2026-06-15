// Server-only: assemble the target-date study plan (#180) from the learner's
// persisted readiness inputs. Pure plan logic lives in interview-plan.ts; this
// only gathers evidence/quality and runs the readiness gate, then delegates.
import { computeReadiness } from "./readiness";
import { getReadinessInputs } from "./readiness-store";
import { GROUP_LABELS } from "./interview-catalog-view";
import { buildStudyPlan, type PlanHorizonWeeks, type StudyPlan } from "./interview-plan";
import type { ProblemGroup } from "./problem-catalog";

const ALL_PATTERNS = Object.keys(GROUP_LABELS) as ProblemGroup[];

/** Build the signed-in learner's study plan for a horizon and daily-time budget. */
export async function getStudyPlan(
  horizonWeeks: PlanHorizonWeeks,
  dailyMinutes: number,
  now: number = Date.now()
): Promise<StudyPlan> {
  const { evidence, mocksCompleted, quality } = await getReadinessInputs(now);
  const report = computeReadiness(evidence, mocksCompleted, quality, { now });
  return buildStudyPlan(report, evidence, ALL_PATTERNS, horizonWeeks, dailyMinutes, now);
}
