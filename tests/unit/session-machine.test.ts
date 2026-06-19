import { describe, expect, it } from "vitest";
import {
  SESSION_PHASES,
  abandonSession,
  advancePhase,
  budgetSeconds,
  canRevealSolution,
  completeSession,
  createSession,
  currentPhase,
  goToPreviousPhase,
  isOverBudget,
  pauseSession,
  remainingSeconds,
  resumeSession,
  tick,
  updatePhaseNote,
  updateSessionEvidence,
  type SessionState
} from "@/features/interview/session-machine";

function practice(): SessionState {
  return createSession({ problemId: "iv.graph.service-init-order", mode: "practice", durationMinutes: 45 });
}

describe("session creation and phases (#177)", () => {
  it("starts at the first phase, in progress, with no elapsed time", () => {
    const s = practice();
    expect(currentPhase(s)).toBe("clarification");
    expect(s.status).toBe("in_progress");
    expect(s.elapsedSeconds).toBe(0);
  });

  it("rejects an unsupported duration", () => {
    expect(() =>
      createSession({ problemId: "x", mode: "interview", durationMinutes: 60 as unknown as 45 })
    ).toThrow();
  });

  it("advances through every phase and then completes", () => {
    let s = practice();
    for (let i = 1; i < SESSION_PHASES.length; i += 1) {
      s = advancePhase(s);
      expect(currentPhase(s)).toBe(SESSION_PHASES[i]);
      expect(s.status).toBe("in_progress");
    }
    s = advancePhase(s); // past the last phase
    expect(s.status).toBe("completed");
    expect(advancePhase(s)).toEqual(s); // no-op once finished
  });

  it("allows going back only in practice mode", () => {
    const adv = advancePhase(practice());
    expect(currentPhase(goToPreviousPhase(adv))).toBe("clarification");

    const interview = advancePhase(
      createSession({ problemId: "x", mode: "interview", durationMinutes: 45 })
    );
    expect(goToPreviousPhase(interview)).toEqual(interview); // forward-only
  });
});

describe("session timing (#177)", () => {
  it("accumulates elapsed time and computes remaining/over-budget", () => {
    let s = practice();
    expect(budgetSeconds(s)).toBe(45 * 60);
    s = tick(s, 600);
    expect(s.elapsedSeconds).toBe(600);
    expect(s.phaseElapsedSeconds.clarification).toBe(600);
    expect(remainingSeconds(s)).toBe(45 * 60 - 600);
    expect(isOverBudget(s)).toBe(false);

    s = tick(advancePhase(s), 45 * 60);
    expect(isOverBudget(s)).toBe(true);
    expect(remainingSeconds(s)).toBe(0);
    expect(s.phaseElapsedSeconds.examples).toBe(45 * 60);
  });

  it("ignores ticks once the session is finished", () => {
    const done = completeSession(practice());
    expect(tick(done, 60)).toEqual(done);
    expect(abandonSession(done)).toEqual(done); // already finished
  });

  it("pauses and resumes practice timing without accruing elapsed time", () => {
    const active = tick(practice(), 30);
    const paused = pauseSession(active);

    expect(paused.status).toBe("paused");
    expect(tick(paused, 60)).toEqual(paused);
    expect(advancePhase(paused)).toEqual(paused);

    const resumed = resumeSession(paused);
    expect(resumed.status).toBe("in_progress");
    expect(tick(resumed, 5).elapsedSeconds).toBe(35);
  });

  it("does not allow interview sessions to pause", () => {
    const interview = createSession({ problemId: "x", mode: "interview", durationMinutes: 45 });
    expect(pauseSession(interview)).toEqual(interview);
  });

  it("can complete or abandon a paused practice session", () => {
    const paused = pauseSession(practice());
    expect(completeSession(paused).status).toBe("completed");
    expect(abandonSession(paused).status).toBe("abandoned");
  });
});

describe("session evidence (#177)", () => {
  it("records notes, draft code, test notes, assistance, and abandonment reason", () => {
    let s = practice();
    s = updatePhaseNote(s, "clarification", "Ask about duplicate keys.");
    s = updateSessionEvidence(s, {
      codeDraft: "int main() { return 0; }",
      testNotes: "sample, empty, duplicate-heavy",
      assistanceUsed: true
    });
    s = abandonSession(s);

    expect(s.notesByPhase.clarification).toContain("duplicate keys");
    expect(s.codeDraft).toContain("main");
    expect(s.testNotes).toContain("empty");
    expect(s.assistanceUsed).toBe(true);
    expect(s.status).toBe("abandoned");
    expect(s.abandonmentReason).toBe("manual_stop");
  });
});

describe("solution gating (#177)", () => {
  it("hides the solution throughout an interview until completion", () => {
    let s = createSession({ problemId: "x", mode: "interview", durationMinutes: 50 });
    for (let i = 0; i < SESSION_PHASES.length - 1; i += 1) {
      expect(canRevealSolution(s)).toBe(false);
      s = advancePhase(s);
    }
    // At the final phase, still hidden in interview mode.
    expect(canRevealSolution(s)).toBe(false);
    s = advancePhase(s); // completes
    expect(canRevealSolution(s)).toBe(true);
  });

  it("unlocks the solution at reflection (or completion) in practice", () => {
    let s = practice();
    expect(canRevealSolution(s)).toBe(false);
    while (currentPhase(s) !== "reflection") {
      s = advancePhase(s);
    }
    expect(canRevealSolution(s)).toBe(true);
  });
});

describe("session state is serializable for persistence across refresh (#177)", () => {
  it("round-trips through JSON unchanged", () => {
    const s = tick(advancePhase(practice()), 120);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});
