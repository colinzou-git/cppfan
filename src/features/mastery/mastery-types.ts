export type SkillStatus =
  | "new"
  | "learning"
  | "weak"
  | "reviewing"
  | "strong"
  | "mastered"
  | "regressed";

export type SkillMastery = {
  skillId: string;
  title: string;
  status: SkillStatus;
  score: number;
  reason: string;
};

export type MasterySummary = {
  authenticated: boolean;
  skills: SkillMastery[];
  counts: Record<SkillStatus, number>;
};

export const SKILL_STATUSES: SkillStatus[] = [
  "new",
  "learning",
  "weak",
  "reviewing",
  "strong",
  "mastered",
  "regressed"
];

export function emptyStatusCounts(): Record<SkillStatus, number> {
  return {
    new: 0,
    learning: 0,
    weak: 0,
    reviewing: 0,
    strong: 0,
    mastered: 0,
    regressed: 0
  };
}
