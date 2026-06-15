import { describe, expect, it } from "vitest";
import { rowToSessionState, sessionStateToRow } from "@/features/interview/interview-session-store";
import { createSession, SESSION_PHASES } from "@/features/interview/session-machine";

// Pure row<->state mappers for persisted interview sessions (#177): they must
// round-trip a valid session and defend against out-of-range stored values.

describe("interview session row mappers (#177)", () => {
  it("round-trips a valid session", () => {
    const state = { ...createSession({ problemId: "iv.x", mode: "interview", durationMinutes: 50 }), phaseIndex: 3 };
    expect(rowToSessionState(sessionStateToRow(state))).toEqual(state);
  });

  it("clamps an out-of-range phase index", () => {
    const high = rowToSessionState({
      problem_id: "iv.x",
      mode: "practice",
      duration_minutes: 45,
      phase_index: 99,
      elapsed_seconds: 10,
      status: "in_progress"
    });
    expect(high.phaseIndex).toBe(SESSION_PHASES.length - 1);

    const low = sessionStateToRow({
      problemId: "iv.x",
      mode: "practice",
      durationMinutes: 45,
      phaseIndex: -5,
      elapsedSeconds: -3,
      status: "in_progress"
    });
    expect(low.phase_index).toBe(0);
    expect(low.elapsed_seconds).toBe(0);
  });

  it("whitelists mode / duration / status, falling back to safe defaults", () => {
    const state = rowToSessionState({
      problem_id: "iv.x",
      mode: "bogus",
      duration_minutes: 99,
      phase_index: 0,
      elapsed_seconds: 0,
      status: "weird"
    });
    expect(state.mode).toBe("practice");
    expect(state.durationMinutes).toBe(45);
    expect(state.status).toBe("in_progress");
  });
});
