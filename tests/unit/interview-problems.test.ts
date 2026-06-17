import { describe, expect, it } from "vitest";
import {
  getInterviewProblem,
  getInterviewProblemsByGroup,
  interviewProblems,
  type ProblemDifficulty,
  type ProblemGroup,
  type RoleRelevance
} from "@/features/interview/problem-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const skillIds = new Set(skillSeed.map((s) => s.id));
const GROUPS = new Set<ProblemGroup>([
  "arrays_hashing_prefix",
  "two_pointers_sliding_window",
  "binary_search",
  "intervals_sweepline",
  "stacks_queues_monotonic",
  "heaps_topk_streaming",
  "linked_cache",
  "trees_bst",
  "graphs_paths",
  "union_find",
  "dp_backtracking",
  "cpp_implementation"
]);
const ROLES = new Set<RoleRelevance>(["general", "systems", "storage", "streaming", "concurrency-adjacent"]);
const DIFFICULTIES = new Set<ProblemDifficulty>(["easy", "medium", "hard"]);

describe("interview problem catalog integrity (#176)", () => {
  it("has unique problem ids", () => {
    const ids = interviewProblems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each problem has complete, valid metadata", () => {
    for (const p of interviewProblems) {
      expect(p.version).toBeGreaterThanOrEqual(1);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.prompt.length).toBeGreaterThan(20);
      expect(GROUPS.has(p.group), `${p.id} group`).toBe(true);
      expect(ROLES.has(p.roleRelevance), `${p.id} role`).toBe(true);
      expect(DIFFICULTIES.has(p.difficulty), `${p.id} difficulty`).toBe(true);
      expect(p.constraints.length).toBeGreaterThan(0);
      expect(p.targetComplexity.length).toBeGreaterThan(0);
      expect(p.requiredEdgeCases.length).toBeGreaterThan(0);
      expect(p.clarifyingQuestions.length).toBeGreaterThan(0);
      expect(p.hintLadder.length).toBeGreaterThanOrEqual(2);
      expect(p.visibleExamples.length).toBeGreaterThan(0);
    }
  });

  it("references only skills that exist in the curriculum", () => {
    for (const p of interviewProblems) {
      expect(skillIds.has(p.primarySkillId), `${p.id} primary skill ${p.primarySkillId}`).toBe(true);
      for (const s of p.secondarySkillIds) {
        expect(skillIds.has(s), `${p.id} secondary skill ${s}`).toBe(true);
      }
    }
  });

  it("every external link has a url and a cppFan annotation (no bare links)", () => {
    for (const p of interviewProblems) {
      for (const link of p.externalLinks) {
        expect(link.url.startsWith("https://"), `${p.id} link url`).toBe(true);
        expect(link.annotation.length).toBeGreaterThan(0);
      }
    }
  });

  it("includes systems-flavored problems across distinct groups", () => {
    expect(interviewProblems.some((p) => p.roleRelevance !== "general")).toBe(true);
    const groups = new Set(interviewProblems.map((p) => p.group));
    expect(groups.size).toBeGreaterThanOrEqual(4);
  });

  it("covers the binary-search group toward the #176 quota (>= 5)", () => {
    const bsearch = getInterviewProblemsByGroup("binary_search");
    expect(bsearch.length).toBeGreaterThanOrEqual(5);
    // Includes a search-on-answer variant, not only array-index search.
    expect(bsearch.some((p) => p.patternTags.includes("search-on-answer"))).toBe(true);
  });

  it("covers the stacks/queues/monotonic group toward the #176 quota (>= 4)", () => {
    const stacks = getInterviewProblemsByGroup("stacks_queues_monotonic");
    expect(stacks.length).toBeGreaterThanOrEqual(4);
    // Includes a monotonic-structure problem, not only plain stack matching.
    expect(stacks.some((p) => p.patternTags.some((t) => t.startsWith("monotonic")))).toBe(true);
  });

  it("accessors resolve by id and group", () => {
    const sample = interviewProblems[0];
    expect(getInterviewProblem(sample.id)?.title).toBe(sample.title);
    expect(getInterviewProblem("nope")).toBeNull();
    expect(getInterviewProblemsByGroup("graphs_paths").length).toBeGreaterThan(0);
  });
});
