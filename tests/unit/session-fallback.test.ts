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

/** A resolved ref: native ids carry a null content version, user ids a versioned one. */
function ref(id: string) {
  return { problem: problem(id), contentVersionId: id === NATIVE ? null : `ver-${id}` };
}

/** Resolver that knows the native problem + a given user problem, else null. */
function resolverFor(...knownIds: string[]) {
  return vi.fn(async (id: string) => (knownIds.includes(id) ? ref(id) : null));
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
      requestedProblem: ref("user.item.req"),
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
      { saved: null, requested: ref("user.item.req"), known: ["user.item.req", NATIVE] },
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

  it("binds the session to the resolved immutable content version (#612)", async () => {
    // A user problem carries its published version; a native problem is null.
    const userR = await resolveSessionWithFallback({
      saved: createSession({ problemId: "user.item.abc", mode: "practice", durationMinutes: 45 }),
      requestedProblem: null,
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor("user.item.abc", NATIVE)
    });
    expect(userR.state.contentVersionId).toBe("ver-user.item.abc");

    const nativeR = await resolveSessionWithFallback({
      saved: createSession({ problemId: NATIVE, mode: "practice", durationMinutes: 45 }),
      requestedProblem: null,
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor(NATIVE)
    });
    expect(nativeR.state.contentVersionId).toBeNull();
  });

  it("preserves a resumed session's bound version instead of silently rebinding (#608)", async () => {
    // The saved session is already bound to v1. The author has since republished
    // (the resolver now returns ver-user.item.abc). The resumed session must keep
    // v1 — submit-time judge resolution reports staleness instead of silently
    // judging against a suite the learner never saw.
    const saved = createSession({ problemId: "user.item.abc", mode: "practice", durationMinutes: 45 });
    saved.contentVersionId = "v1-original";
    const r = await resolveSessionWithFallback({
      saved,
      requestedProblem: null,
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor("user.item.abc", NATIVE)
    });
    expect(r.state.contentVersionId).toBe("v1-original");
  });

  it("stamps a fresh requested session with the resolver version, not any saved one", async () => {
    const saved = createSession({ problemId: "user.item.old", mode: "practice", durationMinutes: 45 });
    saved.contentVersionId = "should-not-carry";
    const r = await resolveSessionWithFallback({
      saved,
      requestedProblem: ref("user.item.req"),
      fallbackProblemId: NATIVE,
      durationMinutes: 45,
      resolve: resolverFor("user.item.req", NATIVE)
    });
    expect(r.state.problemId).toBe("user.item.req");
    expect(r.state.contentVersionId).toBe("ver-user.item.req");
  });
});
