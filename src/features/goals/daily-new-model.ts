import type { AcquisitionState } from "./goal-contract";

export type DailyNewReasonCode =
  | "CONTINUE_UNFINISHED_SKILL"
  | "START_NEW_GOAL_SKILL"
  | "UNFINISHED_PREREQUISITE"
  | "GOAL_DEADLINE_PRIORITY"
  | "LEARN_EXTRA_REQUESTED";

export type DailyNewNoMoreReason =
  | "all_goal_work_complete"
  | "daily_scope_exhausted"
  | "content_unavailable"
  | "only_fsrs_review_remains"
  | "backend_unavailable";

export type DailyNewAction = {
  id: string;
  algorithmVersion: "daily-new-v1";
  localPlanDate: string;
  timezone: string;
  dailyPlanVersion: number;
  itemId: string;
  skillId: string;
  title: string;
  reason: string;
  reasonCodes: DailyNewReasonCode[];
  href: string;
  estimatedMinutes: number | null;
  goalIds: string[];
  goalTitles: string[];
  targetIds: string[];
  primaryGoalId: string;
  revisionId: string;
  primaryTargetId: string;
  actionKind: "start_new_skill" | "continue_acquisition" | "prerequisite_acquisition";
  destinationKind: "learning_item";
  destinationId: string;
  acquisitionStepId: string;
  acquisitionState: Exclude<AcquisitionState, "initial_learning_complete" | "unavailable">;
  acquisitionContractId: string;
  acquisitionContractVersion: number;
  completionEvidenceRule: string;
  platformSuitability: "all_devices";
  platformNote: string;
  source: "planned" | "learn_extra";
  isFsrsReview: false;
};

export type DailyNewPlan = {
  state: "ready" | "signed_out" | "unconfigured" | "unavailable" | "error";
  authenticated: boolean;
  activeGoalCount: number;
  dailyCap: number;
  localPlanDate: string;
  timezone: string;
  dailyPlanVersion: number;
  actions: DailyNewAction[];
  allocatedExtraActions: DailyNewAction[];
  eligibleActions: DailyNewAction[];
  extraAction: DailyNewAction | null;
  noMoreReason: DailyNewNoMoreReason | null;
};
