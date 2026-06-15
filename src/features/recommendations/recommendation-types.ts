export type RecommendationKind =
  | "due_reviews"
  | "regressed_skill"
  | "weak_skill"
  | "placement_start"
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

/** A placement-derived starting suggestion for a module (#125). */
export type PlacementStartRef = {
  moduleId: string;
  title: string;
  itemId: string | null;
  level: "start_here" | "review_soon";
};

export type RecommendationInput = {
  dueReviewCount: number;
  dailyReviewMinutes: number | null;
  regressedSkills: SkillRef[];
  weakSkills: SkillRef[];
  /** Placement-check starting suggestions, ranked (start_here before review_soon). */
  placementStarts: PlacementStartRef[];
  nextLesson: SkillRef | null;
  prerequisite: SkillRef | null;
};

export type DailyPlan = {
  authenticated: boolean;
  recommendations: Recommendation[];
};
