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
  remainingSeconds,
  tick,
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
    expect(remainingSeconds(s)).toBe(45 * 60 - 600);
    expect(isOverBudget(s)).toBe(false);

    s = tick(s, 45 * 60);
    expect(isOverBudget(s)).toBe(true);
    expect(remainingSeconds(s)).toBe(0);
  });

  it("ignores ticks once the session is finished", () => {
    const done = completeSession(practice());
    expect(tick(done, 60)).toEqual(done);
    expect(abandonSession(done)).toEqual(done); // already finished
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
