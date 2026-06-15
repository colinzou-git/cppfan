export type RecommendationKind =
  | "due_reviews"
  | "regressed_skill"
  | "weak_skill"
  | "remediation"
  | "placement_start"
  | "next_lesson"
  | "prerequisite"
  | "capstone_milestone"
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

/** An observed-misconception remediation suggestion (#126). */
export type MisconceptionRef = {
  title: string;
  reason: string;
  itemId: string | null;
};

/** A placement-derived starting suggestion for a module (#125). */
export type PlacementStartRef = {
  moduleId: string;
  title: string;
  itemId: string | null;
  level: "start_here" | "review_soon";
};

/** The learner's next incomplete required capstone milestone (#130). */
export type CapstoneMilestoneRef = {
  milestoneId: string;
  title: string;
  projectTitle: string;
};

export type RecommendationInput = {
  dueReviewCount: number;
  dailyReviewMinutes: number | null;
  regressedSkills: SkillRef[];
  weakSkills: SkillRef[];
  /** Observed-misconception remediation suggestions (#126). */
  misconceptions: MisconceptionRef[];
  /** Placement-check starting suggestions, ranked (start_here before review_soon). */
  placementStarts: PlacementStartRef[];
  nextLesson: SkillRef | null;
  prerequisite: SkillRef | null;
  /** Next capstone milestone to build, or null. */
  nextMilestone: CapstoneMilestoneRef | null;
};

export type DailyPlan = {
  authenticated: boolean;
  recommendations: Recommendation[];
};
