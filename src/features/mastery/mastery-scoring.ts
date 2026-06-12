import type { ScoringEvent } from "@/features/events/event-types";
import type { SkillStatus } from "./mastery-types";

export type SkillScore = {
  status: SkillStatus;
  score: number;
  reason: string;
};

/*
 * Rule-based mastery scoring v1. Deterministic and explainable — no ML, and
 * deliberately independent of FSRS card state (a learner can have a stable
 * review card yet still be weak in the broader skill; see docs/SKILL_ENGINE.md).
 *
 * Rules are evaluated in priority order: explicit mastery markers first, then
 * recent correctness, then weakness signals, then review/learning activity.
 */
export function scoreSkillFromEvents(events: ScoringEvent[]): SkillScore {
  if (events.length === 0) {
    return { status: "new", score: 0, reason: "No activity yet." };
  }

  const ordered = [...events].sort((a, b) => a.event_time.localeCompare(b.event_time));

  let correct = 0;
  let wrong = 0;
  let reviews = 0;
  let hints = 0;
  let lastMarker: "skill_mastered" | "skill_regressed" | null = null;

  for (const event of ordered) {
    switch (event.event_type) {
      case "quiz_correct":
      case "code_passed":
        correct += 1;
        break;
      case "quiz_wrong":
        wrong += 1;
        break;
      case "review_completed":
        reviews += 1;
        break;
      case "hint_used":
        hints += 1;
        break;
      case "skill_mastered":
        lastMarker = "skill_mastered";
        break;
      case "skill_regressed":
        lastMarker = "skill_regressed";
        break;
      default:
        break;
    }
  }

  const attempts = correct + wrong;
  const correctness = attempts > 0 ? correct / attempts : 0;
  const score = Math.max(
    0,
    Math.min(100, Math.round(correctness * 100) - hints * 5 + Math.min(reviews, 4) * 5)
  );

  if (lastMarker === "skill_regressed") {
    return { status: "regressed", score, reason: "Recent failure after the skill was strong." };
  }
  if (lastMarker === "skill_mastered") {
    return { status: "mastered", score: Math.max(score, 90), reason: "Strong performance across sessions." };
  }
  if (attempts >= 2 && correctness >= 0.8) {
    return { status: "strong", score, reason: "Recent answers are mostly correct." };
  }
  if (attempts > 0 && (wrong > correct || hints >= 2)) {
    return { status: "weak", score, reason: "Recent mistakes or repeated hint usage." };
  }
  if (reviews > 0 && attempts === 0) {
    return { status: "reviewing", score, reason: "Active reviews without recent quiz evidence." };
  }

  return { status: "learning", score, reason: "Started learning this skill." };
}
