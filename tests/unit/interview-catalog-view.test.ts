import { describe, expect, it } from "vitest";
import { GROUP_LABELS, groupInterviewProblems } from "@/features/interview/interview-catalog-view";
import { getInterviewProblems } from "@/features/interview/problem-catalog";

// Interview catalog view (#176/#174): groups the typed problems by pattern for
// the read-only catalog page.

describe("groupInterviewProblems (#176)", () => {
  const groups = groupInterviewProblems();

  it("includes every problem exactly once across the groups", () => {
    const grouped = groups.flatMap((g) => g.problems.map((p) => p.id)).sort();
    const all = getInterviewProblems()
      .map((p) => p.id)
      .sort();
    expect(grouped).toEqual(all);
  });

  it("omits empty groups and labels every shown group", () => {
    for (const group of groups) {
      expect(group.problems.length).toBeGreaterThan(0);
      expect(GROUP_LABELS[group.group]).toBeTruthy();
    }
  });

  it("every problem in a group actually belongs to that group", () => {
    for (const group of groups) {
      expect(group.problems.every((p) => p.group === group.group)).toBe(true);
    }
  });
});
