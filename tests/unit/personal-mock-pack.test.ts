import { describe, expect, it } from "vitest";
import {
  reconcilePersonalMockPack,
  composePersonalMockPack,
  dedupeSelections,
  type PersonalMockSelection
} from "@/features/interview/personal-mock-pack";
import type { InterviewPlanningCandidate } from "@/features/interview/interview-planning-candidates";

function candidate(over: Partial<InterviewPlanningCandidate> & { problemId: string }): InterviewPlanningCandidate {
  return {
    source: "native",
    title: over.problemId,
    group: "arrays_hashing_prefix",
    patternTags: [],
    interviewCore: false,
    recommendationEnabled: true,
    ...over
  };
}

describe("personal mock pack reconciliation (#613)", () => {
  const candidates: InterviewPlanningCandidate[] = [
    candidate({ problemId: "native-1", title: "Native One" }),
    candidate({ problemId: "user.item.a", source: "user", title: "Custom A", contentVersionId: "v2" })
  ];

  it("keeps native + same-version custom selections as ok, with titles", () => {
    const selections: PersonalMockSelection[] = [
      { problemId: "native-1", source: "native" },
      { problemId: "user.item.a", source: "user", contentVersionId: "v2" }
    ];
    const r = reconcilePersonalMockPack(selections, candidates);
    expect(r.ok.map((i) => i.problemId)).toEqual(["native-1", "user.item.a"]);
    expect(r.ok.find((i) => i.problemId === "user.item.a")?.title).toBe("Custom A");
    expect(r.unavailable).toEqual([]);
    expect(r.versionChanged).toEqual([]);
  });

  it("flags an unavailable problem instead of silently dropping/substituting it", () => {
    const r = reconcilePersonalMockPack([{ problemId: "user.item.gone", source: "user", contentVersionId: "v1" }], candidates);
    expect(r.unavailable.map((s) => s.problemId)).toEqual(["user.item.gone"]);
    expect(r.ok).toEqual([]);
  });

  it("flags a custom item whose published version changed, with the current version", () => {
    const r = reconcilePersonalMockPack([{ problemId: "user.item.a", source: "user", contentVersionId: "v1" }], candidates);
    expect(r.ok).toEqual([]);
    expect(r.versionChanged).toHaveLength(1);
    expect(r.versionChanged[0].currentVersionId).toBe("v2");
    expect(r.versionChanged[0].title).toBe("Custom A");
  });

  it("dedupes repeated problem ids (a pack never repeats a problem)", () => {
    const deduped = dedupeSelections([
      { problemId: "x", source: "native" },
      { problemId: "x", source: "native" },
      { problemId: "y", source: "native" }
    ]);
    expect(deduped.map((s) => s.problemId)).toEqual(["x", "y"]);
  });

  it("composes a pack, defaulting a blank title", () => {
    const pack = composePersonalMockPack("p1", "   ", [{ problemId: "native-1", source: "native", title: "Native One" }]);
    expect(pack).toMatchObject({ id: "p1", title: "My mock pack" });
    expect(pack.items).toHaveLength(1);
  });
});
