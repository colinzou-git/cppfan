import { describe, expect, it } from "vitest";
import { rowToSessionState, sessionStateToRow } from "@/features/interview/interview-session-store";
import { createSession, SESSION_PHASES } from "@/features/interview/session-machine";

// Pure row<->state mappers for persisted interview sessions (#177): they must
// round-trip a valid session and defend against out-of-range stored values.

describe("interview session row mappers (#177)", () => {
  it("round-trips a valid session", () => {
    const state = {
      ...createSession({ problemId: "iv.x", mode: "interview", durationMinutes: 50 }),
      phaseIndex: 3,
      phaseElapsedSeconds: {
        clarification: 30,
        examples: 40,
        baseline: 50,
        optimization: 0,
        implementation: 0,
        testing: 0,
        complexity: 0,
        follow_up: 0,
        reflection: 0
      },
      notesByPhase: { baseline: "state invariant first" },
      codeDraft: "class Solution {};",
      testNotes: "sample and edge cases",
      assistanceUsed: true,
      abandonmentReason: null
    };
    expect(rowToSessionState(sessionStateToRow(state))).toEqual(state);
  });

  it("clamps an out-of-range phase index", () => {
    const high = rowToSessionState({
      problem_id: "iv.x",
      mode: "practice",
      duration_minutes: 45,
      phase_index: 99,
      elapsed_seconds: 10,
      phase_elapsed_seconds: { clarification: 5, examples: -2 },
      status: "in_progress"
    });
    expect(high.phaseIndex).toBe(SESSION_PHASES.length - 1);
    expect(high.phaseElapsedSeconds.clarification).toBe(5);
    expect(high.phaseElapsedSeconds.examples).toBe(0);

    const low = sessionStateToRow({
      problemId: "iv.x",
      mode: "practice",
      durationMinutes: 45,
      phaseIndex: -5,
      elapsedSeconds: -3,
      phaseElapsedSeconds: { ...high.phaseElapsedSeconds, clarification: -10 },
      notesByPhase: { clarification: "x".repeat(5000) },
      codeDraft: "x".repeat(13000),
      testNotes: "y".repeat(5000),
      assistanceUsed: false,
      abandonmentReason: "z".repeat(600),
      status: "in_progress"
    });
    expect(low.phase_index).toBe(0);
    expect(low.elapsed_seconds).toBe(0);
    const lowNotes = low.notes_by_phase as Record<string, string>;
    expect(lowNotes.clarification.length).toBe(4000);
    expect(low.code_draft?.length).toBe(12000);
    expect(low.test_notes?.length).toBe(4000);
    expect(low.abandonment_reason?.length).toBe(500);
  });

  it("whitelists mode / duration / status, falling back to safe defaults", () => {
    const state = rowToSessionState({
      problem_id: "iv.x",
      mode: "bogus",
      duration_minutes: 99,
      phase_index: 0,
      elapsed_seconds: 0,
      phase_elapsed_seconds: [],
      notes_by_phase: [],
      code_draft: null,
      test_notes: null,
      assistance_used: null,
      abandonment_reason: null,
      status: "weird"
    });
    expect(state.mode).toBe("practice");
    expect(state.durationMinutes).toBe(45);
    expect(state.status).toBe("in_progress");
  });
});
