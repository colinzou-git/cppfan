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
  source: "planned" | "learn_extra";
};

export type DailyNewPlan = {
  state: "ready" | "signed_out" | "unconfigured" | "unavailable" | "error";
  authenticated: boolean;
  activeGoalCount: number;
  dailyCap: number;
  actions: DailyNewAction[];
  extraAction: DailyNewAction | null;
};
