import type { Recommendation, RecommendationInput, SkillRef } from "./recommendation-types";

/*
 * Rule-based daily-plan ordering (no ML). Follows the recommendation order in
 * docs/SKILL_ENGINE.md:
 *   1. Due reviews
 *   2. Regressed skills
 *   3. Weak skills
 *   4. Current learning path (next lesson)
 *   5. Recommended prerequisites
 *   6. Optional exploration (always offered as a fallback)
 *
 * Pure and deterministic so the ordering can be unit tested directly.
 */
function skillHref(ref: SkillRef): string {
  return ref.itemId ? `/learn/${encodeURIComponent(ref.itemId)}` : "/dashboard";
}

export function buildRecommendations(input: RecommendationInput): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (input.dueReviewCount > 0) {
    const plural = input.dueReviewCount === 1 ? "" : "s";
    const minutes = input.dailyReviewMinutes ? ` Your daily target is about ${input.dailyReviewMinutes} min.` : "";
    recommendations.push({
      kind: "due_reviews",
      title: `Review ${input.dueReviewCount} due card${plural}`,
      reason: `${input.dueReviewCount} review${plural} ${plural ? "are" : "is"} due now.${minutes}`,
      href: "/review"
    });
  }

  for (const skill of input.regressedSkills) {
    recommendations.push({
      kind: "regressed_skill",
      title: `Revisit ${skill.title}`,
      reason: "This skill regressed — recent answers slipped after it was strong.",
      href: skillHref(skill)
    });
  }

  for (const skill of input.weakSkills) {
    recommendations.push({
      kind: "weak_skill",
      title: `Practice ${skill.title}`,
      reason: "Recent mistakes or repeated hints suggest this skill is still weak.",
      href: skillHref(skill)
    });
  }

  if (input.nextLesson) {
    recommendations.push({
      kind: "next_lesson",
      title: `Start ${input.nextLesson.title}`,
      reason: "The next step on your current C++ path.",
      href: skillHref(input.nextLesson)
    });
  }

  if (input.prerequisite) {
    recommendations.push({
      kind: "prerequisite",
      title: `Shore up ${input.prerequisite.title} first`,
      reason: "A recommended prerequisite for your next skill — a suggestion, not a hard lock.",
      href: skillHref(input.prerequisite)
    });
  }

  recommendations.push({
    kind: "explore",
    title: "Explore the skill map",
    reason: "Browse the modules and pick anything that interests you.",
    href: "/dashboard"
  });

  return recommendations;
}
