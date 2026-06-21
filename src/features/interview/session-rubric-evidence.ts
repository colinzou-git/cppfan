import type { PhaseElapsedSeconds, PhaseNotes } from "./session-machine";
import type { RubricCriterionId, RubricScore } from "./rubric";

export type JudgeEvidenceSummary = {
  compiled: boolean;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  status: string;
};

export type SessionRubricEvidence = {
  sessionId: string;
  durationMinutes: number;
  elapsedSeconds: number;
  phaseElapsedSeconds: Partial<PhaseElapsedSeconds>;
  notesByPhase: PhaseNotes;
  testNotes: string;
  assistanceUsed: boolean;
  judge?: JudgeEvidenceSummary | null;
};

function clampScore(score: number): number {
  return Math.min(4, Math.max(0, Math.round(score)));
}

function ratio(passed: number, total: number): number | null {
  if (!Number.isFinite(total) || total <= 0) return null;
  return Math.min(1, Math.max(0, passed / total));
}

function scoreFromRatio(value: number | null): number {
  if (value === null) return 0;
  if (value >= 1) return 4;
  if (value >= 0.75) return 3;
  if (value >= 0.5) return 2;
  if (value > 0) return 1;
  return 0;
}

function hasText(value: string | undefined, minLength = 12): boolean {
  return typeof value === "string" && value.trim().length >= minLength;
}

function phaseSeconds(evidence: SessionRubricEvidence, phase: keyof PhaseElapsedSeconds): number {
  const raw = evidence.phaseElapsedSeconds[phase];
  return typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
}

function communicationCoverage(notes: PhaseNotes): number {
  const phases = ["clarification", "examples", "baseline", "optimization", "complexity", "reflection"] as const;
  return phases.filter((phase) => hasText(notes[phase], 10)).length;
}

function automated(criterion: RubricCriterionId, score: number): RubricScore {
  return { criterion, score: clampScore(score), source: "automated" };
}

export function automatedScoresFromSessionEvidence(evidence: SessionRubricEvidence): RubricScore[] {
  const judge = evidence.judge ?? null;
  const visible = judge ? ratio(judge.visiblePassed, judge.visibleTotal) : null;
  const hidden = judge ? ratio(judge.hiddenPassed, judge.hiddenTotal) : null;
  const all = judge ? ratio(judge.visiblePassed + judge.hiddenPassed, judge.visibleTotal + judge.hiddenTotal) : null;
  const budgetSeconds = evidence.durationMinutes * 60;
  const testingSeconds = phaseSeconds(evidence, "testing");
  const notes = evidence.notesByPhase;
  const testNotesPresent = hasText(evidence.testNotes, 20);
  const communication = communicationCoverage(notes);

  return [
    automated("correctness", scoreFromRatio(hidden ?? visible ?? all)),
    automated("cpp_implementation", judge ? (judge.compiled ? Math.max(2, scoreFromRatio(all)) : 0) : 0),
    automated("testing", (testNotesPresent ? 2 : 0) + (testingSeconds >= 120 ? 1 : 0) + (hidden === 1 ? 1 : 0)),
    automated("complexity", hasText(notes.complexity, 12) ? 3 : 1),
    automated("communication", communication >= 5 ? 4 : communication >= 3 ? 3 : communication >= 1 ? 2 : 1),
    automated("time_management", evidence.elapsedSeconds <= budgetSeconds ? 4 : evidence.elapsedSeconds <= budgetSeconds * 1.15 ? 3 : 2),
    automated("hint_dependence", evidence.assistanceUsed ? 2 : 4),
    automated("follow_up_adaptability", hasText(notes.follow_up, 12) ? 3 : 1)
  ];
}
