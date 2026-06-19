export type DailyNewAction = {
  id: string;
  itemId: string;
  skillId: string;
  title: string;
  reason: string;
  href: string;
  estimatedMinutes: number | null;
  goalIds: string[];
  goalTitles: string[];
  targetIds: string[];
  primaryGoalId: string;
  revisionId: string;
  primaryTargetId: string;
  acquisitionContractVersion: number;
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
};
