// Weekly interview-practice progress (#180). Pure and deterministic: buckets the
// learner's recent evidence into trailing weeks and reports the signals that
// matter for readiness (independent unseen successes, mock days, correct rate),
// separated from raw practice volume. Drives the progress view and is testable in
// isolation. Never reads or writes FSRS.
import { isIndependentUnseenSuccess, type InterviewEvidence } from "./readiness";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type WeekProgress = {
  /** 0 = the current trailing week, 1 = the week before, ... */
  weekIndex: number;
  label: string;
  attempts: number;
  /** Distinct unseen problems solved independently and unhinted — the key signal. */
  independentUnseenSuccesses: number;
  /** Distinct days carrying mock-context evidence. */
  mockDays: number;
  correctRate: number | null;
};

export type ProgressSummary = {
  /** Most recent week first, exactly `weeks` entries. */
  weeks: WeekProgress[];
  totalAttempts: number;
  totalIndependentUnseenSuccesses: number;
};

function weekLabel(weekIndex: number): string {
  if (weekIndex === 0) {
    return "This week";
  }
  if (weekIndex === 1) {
    return "Last week";
  }
  return `${weekIndex} weeks ago`;
}

/** Bucket evidence into the last `weeks` trailing weeks (most recent first). */
export function summarizeProgress(evidence: InterviewEvidence[], now: number, weeks: number): ProgressSummary {
  const horizon = Math.max(1, Math.trunc(weeks));
  const buckets = Array.from({ length: horizon }, (_, weekIndex) => ({
    weekIndex,
    attempts: 0,
    correct: 0,
    unseenProblems: new Set<string>(),
    mockDayKeys: new Set<number>()
  }));

  let totalAttempts = 0;
  let totalIndependentUnseenSuccesses = 0;
  const overallUnseenProblems = new Set<string>();

  for (const e of evidence) {
    const age = now - e.completedAtMs;
    if (age < 0) {
      continue;
    }
    const weekIndex = Math.floor(age / WEEK_MS);
    if (weekIndex >= horizon) {
      continue;
    }
    const bucket = buckets[weekIndex];
    bucket.attempts += 1;
    totalAttempts += 1;
    if (e.correct) {
      bucket.correct += 1;
    }
    if (isIndependentUnseenSuccess(e)) {
      bucket.unseenProblems.add(e.problemId);
      overallUnseenProblems.add(e.problemId);
    }
    if (e.context === "mock") {
      bucket.mockDayKeys.add(Math.floor(e.completedAtMs / DAY_MS));
    }
  }

  totalIndependentUnseenSuccesses = overallUnseenProblems.size;

  const weeksOut: WeekProgress[] = buckets.map((bucket) => ({
    weekIndex: bucket.weekIndex,
    label: weekLabel(bucket.weekIndex),
    attempts: bucket.attempts,
    independentUnseenSuccesses: bucket.unseenProblems.size,
    mockDays: bucket.mockDayKeys.size,
    correctRate: bucket.attempts > 0 ? bucket.correct / bucket.attempts : null
  }));

  return { weeks: weeksOut, totalAttempts, totalIndependentUnseenSuccesses };
}
