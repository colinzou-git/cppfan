export type RecommendationKind =
  | "due_reviews"
  | "regressed_skill"
  | "weak_skill"
  | "next_lesson"
  | "prerequisite"
  | "explore";

export type Recommendation = {
  kind: RecommendationKind;
  title: string;
  reason: string;
  href: string;
};

/** A skill (optionally with a learning item to open) referenced by a recommendation. */
export type SkillRef = {
  skillId: string;
  title: string;
  itemId: string | null;
};

export type RecommendationInput = {
  dueReviewCount: number;
  dailyReviewMinutes: number | null;
  regressedSkills: SkillRef[];
  weakSkills: SkillRef[];
  nextLesson: SkillRef | null;
  prerequisite: SkillRef | null;
};

export type DailyPlan = {
  authenticated: boolean;
  recommendations: Recommendation[];
};
