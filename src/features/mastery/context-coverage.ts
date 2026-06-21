import {
  MASTERY_EVIDENCE_CONTEXTS,
  type ContextEvidence,
  type CoverageEvent,
  type MasteryEvidenceContext,
  type SkillContextCoverage
} from "./context-coverage-types";

/**
 * Derives cross-context mastery coverage from the existing event ledger (#417).
 * Deterministic and conservative: event types with no clear context map to null
 * rather than being guessed. No new table — coverage is read from skill_events.
 */

// Stable, conservative event_type -> context mapping.
const EVENT_CONTEXT: Record<string, MasteryEvidenceContext> = {
  quiz_correct: "recognition",
  quiz_wrong: "recognition",
  quiz_attempted: "recognition",
  completion_submitted: "completion",
  parsons_submitted: "parsons",
  code_attempted: "code_lab",
  code_passed: "code_lab",
  review_completed: "delayed_review",
  capstone_milestone_completed: "project_milestone",
  bug_spotting_submitted: "bug_spotting",
  code_reading_submitted: "code_reading"
};

export function getEvidenceContextForEvent(event: CoverageEvent): MasteryEvidenceContext | null {
  return EVENT_CONTEXT[event.event_type] ?? null;
}

function emptyContexts(): Record<MasteryEvidenceContext, ContextEvidence> {
  const contexts = {} as Record<MasteryEvidenceContext, ContextEvidence>;
  for (const context of MASTERY_EVIDENCE_CONTEXTS) {
    contexts[context] = { count: 0, recentSuccessCount: 0, recentFailureCount: 0 };
  }
  return contexts;
}

function isSuccess(event: CoverageEvent): boolean | null {
  switch (event.event_type) {
    case "quiz_correct":
    case "code_passed":
      return true;
    case "quiz_wrong":
      return false;
    case "completion_submitted":
    case "parsons_submitted": {
      const correct = event.metadata?.is_correct;
      return correct === true ? true : correct === false ? false : null;
    }
    case "review_completed":
    case "capstone_milestone_completed":
    case "code_reading_submitted":
      return true;
    case "bug_spotting_submitted": {
      const correct = event.metadata?.is_correct;
      return correct === true ? true : correct === false ? false : null;
    }
    default:
      return null;
  }
}

export function getCoverageForSkill(input: {
  skillId: string;
  events: CoverageEvent[];
}): SkillContextCoverage {
  const contexts = emptyContexts();
  for (const event of input.events) {
    const context = getEvidenceContextForEvent(event);
    if (!context) continue;
    const bucket = contexts[context];
    bucket.count += 1;
    const success = isSuccess(event);
    if (success === true) bucket.recentSuccessCount += 1;
    else if (success === false) bucket.recentFailureCount += 1;
    if (event.event_time && (!bucket.lastSeenAt || event.event_time > bucket.lastSeenAt)) {
      bucket.lastSeenAt = event.event_time;
    }
  }
  return { skillId: input.skillId, contexts };
}

export function buildSkillContextCoverage(events: CoverageEvent[]): SkillContextCoverage[] {
  const bySkill = new Map<string, CoverageEvent[]>();
  for (const event of events) {
    const skillId = event.skill_id;
    if (!skillId) continue;
    const list = bySkill.get(skillId) ?? [];
    list.push(event);
    bySkill.set(skillId, list);
  }
  return [...bySkill.entries()].map(([skillId, skillEvents]) =>
    getCoverageForSkill({ skillId, events: skillEvents })
  );
}

/** Contexts that have at least one piece of evidence. */
export function coveredContexts(coverage: SkillContextCoverage): MasteryEvidenceContext[] {
  return MASTERY_EVIDENCE_CONTEXTS.filter((context) => coverage.contexts[context].count > 0);
}
