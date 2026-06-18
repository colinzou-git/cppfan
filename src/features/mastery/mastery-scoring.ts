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
 * Recency policy (#144): mastery reflects CURRENT ability, not all-time totals.
 * Scoring uses only evidence within RECENCY_WINDOW_DAYS of the scoring time and
 * caps to the most recent MAX_RECENT_EVENTS, so old successes cannot dominate
 * forever and the work stays bounded. Explicit skill_mastered/skill_regressed
 * markers are honored only until newer ordinary evidence contradicts them, so a
 * recent failure can lower a strong skill and recent successes can recover one —
 * no permanent marker override. The scoring time is injectable for deterministic
 * tests; it defaults to the most recent event's time.
 */
export const RECENCY_WINDOW_DAYS = 90;
const RECENCY_WINDOW_MS = RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const MAX_RECENT_EVENTS = 50;

function toMs(value: string | number): number {
  return typeof value === "number" ? value : Date.parse(value);
}

export function scoreSkillFromEvents(events: ScoringEvent[], now?: string | number): SkillScore {
  if (events.length === 0) {
    return { status: "new", score: 0, reason: "No activity yet." };
  }

  const ordered = [...events].sort((a, b) => a.event_time.localeCompare(b.event_time));
  // Bound the work: only the most recent events can matter.
  const capped = ordered.slice(-MAX_RECENT_EVENTS);

  const nowMs = now !== undefined ? toMs(now) : Date.parse(capped[capped.length - 1].event_time);
  const windowed = capped.filter((event) => {
    const t = Date.parse(event.event_time);
    return Number.isNaN(t) || Number.isNaN(nowMs) || nowMs - t <= RECENCY_WINDOW_MS;
  });
  // If every event is older than the window, fall back to the bounded recent set
  // so we still reflect the last known state rather than nothing.
  const recent = windowed.length > 0 ? windowed : capped;

  let correct = 0;
  let wrong = 0;
  let reviews = 0;
  let hints = 0;
  let reconstruction = 0;
  let independent = 0;
  let lastMarker: "skill_mastered" | "skill_regressed" | null = null;
  let lastMarkerIndex = -1;

  recent.forEach((event, index) => {
    switch (event.event_type) {
      case "quiz_correct":
        correct += 1;
        break;
      case "completion_submitted":
      case "parsons_submitted": {
        reconstruction += 1;
        const isCorrect = event.metadata?.is_correct;
        if (isCorrect === true) {
          correct += 1;
        } else if (isCorrect === false) {
          wrong += 1;
        }
        break;
      }
      case "code_passed":
        independent += 1;
        correct += 1;
        break;
      case "quiz_wrong":
        wrong += 1;
        break;
      case "review_completed":
        reviews += 1;
        break;
      case "hint_used":
      case "parsons_hint_used":
        hints += 1;
        break;
      case "skill_mastered":
        lastMarker = "skill_mastered";
        lastMarkerIndex = index;
        break;
      case "skill_regressed":
        lastMarker = "skill_regressed";
        lastMarkerIndex = index;
        break;
      default:
        break;
    }
  });

  const sinceMarker = lastMarkerIndex >= 0 ? recent.slice(lastMarkerIndex + 1) : [];
  const failedSinceMarker = sinceMarker.some(
    (event) =>
      event.event_type === "quiz_wrong" ||
      event.event_type === "hint_used" ||
      event.event_type === "parsons_hint_used" ||
      ((event.event_type === "completion_submitted" || event.event_type === "parsons_submitted") &&
        event.metadata?.is_correct === false)
  );
  const passedSinceMarker = sinceMarker.some(
    (event) =>
      event.event_type === "quiz_correct" ||
      event.event_type === "code_passed" ||
      ((event.event_type === "completion_submitted" || event.event_type === "parsons_submitted") &&
        event.metadata?.is_correct === true)
  );

  const attempts = correct + wrong;
  const correctness = attempts > 0 ? correct / attempts : 0;
  const score = Math.max(
    0,
    Math.min(100, Math.round(correctness * 100) - hints * 5 + Math.min(reviews, 4) * 5)
  );

  // Markers are honored only until newer ordinary evidence contradicts them.
  if (lastMarker === "skill_regressed" && !passedSinceMarker) {
    return { status: "regressed", score, reason: "Marked regressed with no recent recovery." };
  }
  if (lastMarker === "skill_mastered" && !failedSinceMarker) {
    return { status: "mastered", score: Math.max(score, 90), reason: "Marked mastered with no recent setbacks." };
  }

  if (attempts >= 2 && correctness >= 0.8) {
    const evidence = independent > 0 ? "independent practice" : reconstruction > 0 ? "reconstruction practice" : "recognition practice";
    return { status: "strong", score, reason: `Recent ${evidence} is mostly correct.` };
  }
  if (attempts > 0 && (wrong > correct || hints >= 2)) {
    return { status: "weak", score, reason: "Recent mistakes or repeated hint usage." };
  }
  if (reviews > 0 && attempts === 0) {
    return { status: "reviewing", score, reason: "Active reviews without recent quiz evidence." };
  }

  return { status: "learning", score, reason: "Started learning this skill." };
}
