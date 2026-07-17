import { describe, expect, it, vi } from "vitest";
import { resolveSessionWithFallback } from "@/features/interview/session-fallback";
import { createSession } from "@/features/interview/session-machine";
import type { InterviewProblem } from "@/features/interview/problem-catalog";

function problem(id: string): InterviewProblem {
  // Only `id` is read by the helper; the rest is filler for the type.
  return {
    id,
    version: 1,
    title: id,
    prompt: "",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "s",
    secondarySkillIds: [],
    patternTags: [],
    constraints: "",
    targetComplexity: "",
    requiredEdgeCases: [],
    clarifyingQuestions: [],
    hintLadder: [],
    visibleExamples: [],
    externalLinks: [],
    interviewCore: false
  } as InterviewProblem;
}

const NATIVE = "native-array-problem";

/** Resolver that knows the native problem + a given user problem, else null. */
function resolverFor(...knownIds: string[]) {
  return vi.fn(async (id: string) => (knownIds.includes(id) ? problem(id) : null));
}

describe("resolveSessionWithFallback (#608)", () => {
  it("resumes a resolvable saved session unchanged", async () => {
    const saved = createSession({ problemId: "user.item.abc", mode: "practice", durationMinutes: 45 });
    const r = await resolveSessionWithFallback({
      saved,
      requestedProblem: null,
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor("user.item.abc", NATIVE)
    });
    expect(r.staleReplaced).toBe(false);
    expect(r.state.problemId).toBe("user.item.abc");
    expect(r.problem?.id).toBe("user.item.abc");
  });

  it("starts a fresh session on a requested problem", async () => {
    const r = await resolveSessionWithFallback({
      saved: createSession({ problemId: NATIVE, mode: "practice", durationMinutes: 45 }),
      requestedProblem: problem("user.item.req"),
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor("user.item.req", NATIVE)
    });
    expect(r.state.problemId).toBe("user.item.req");
    expect(r.problem?.id).toBe("user.item.req");
    expect(r.staleReplaced).toBe(false);
  });

  it("replaces a stale saved user problem with a FRESH session on the fallback", async () => {
    // The saved problem no longer resolves (archived/deleted/unpublished).
    const saved = createSession({ problemId: "user.item.gone", mode: "practice", durationMinutes: 45 });
    saved.codeDraft = "stale code that must not carry over";
    const r = await resolveSessionWithFallback({
      saved,
      requestedProblem: null,
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor(NATIVE) // only the native problem resolves
    });
    expect(r.staleReplaced).toBe(true);
    // Fresh session bound to the fallback — no stale id or code.
    expect(r.state.problemId).toBe(NATIVE);
    expect(r.state.codeDraft).toBe("");
    // The displayed problem id and the acted-on session id are identical.
    expect(r.problem?.id).toBe(r.state.problemId);
  });

  it("keeps displayed problem id === session problem id in every branch", async () => {
    for (const scenario of [
      { saved: createSession({ problemId: "user.item.gone", mode: "practice" as const, durationMinutes: 45 }), requested: null, known: [NATIVE] },
      { saved: null, requested: problem("user.item.req"), known: ["user.item.req", NATIVE] },
      { saved: createSession({ problemId: NATIVE, mode: "practice" as const, durationMinutes: 45 }), requested: null, known: [NATIVE] }
    ]) {
      const r = await resolveSessionWithFallback({
        saved: scenario.saved,
        requestedProblem: scenario.requested,
        fallbackProblemId: NATIVE,
        durationMinutes: 45,
        resolve: resolverFor(...scenario.known)
      });
      expect(r.problem?.id).toBe(r.state.problemId);
    }
  });
});
