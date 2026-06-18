import { describe, expect, it } from "vitest";
import {
  checkboxCount,
  evaluateIssueClosure,
  evaluatePullRequestClosure,
  hasFinalAudit,
  hasUncheckedBoxes,
  isCompletionTracked,
  latestFinalAuditIndex,
  mentionsRemainingWork
} from "../../scripts/ci/closure-guard.mjs";

// Closure-guard regression proof (#147, parent #132). The pure logic here is the
// same module the GitHub Action runs, so these fixtures prove the production guard.

const COMPLETE_AUDIT = "## Final closure audit\n\nEvery acceptance criterion maps to a test/PR. Done.";

describe("completion-tracked detection (#147)", () => {
  it("treats roadmap/completion/parent issues as tracked", () => {
    expect(isCompletionTracked({ title: "Roadmap: expand cppFan" })).toBe(true);
    expect(isCompletionTracked({ title: "Complete string fundamentals from #79" })).toBe(true);
    expect(isCompletionTracked({ title: "Add adaptive practice", labels: ["planning"] })).toBe(true);
    expect(
      isCompletionTracked({ title: "Some feature", body: "- [ ] a\n- [x] b\n- [ ] c" })
    ).toBe(true);
  });

  it("treats a focused one-PR bug/chore issue as NOT tracked", () => {
    expect(
      isCompletionTracked({
        title: "Fix open-redirect in auth next path",
        labels: ["bug", "security"],
        body: "Steps to reproduce...\n\n- [ ] add a regression test"
      })
    ).toBe(false);
  });
});

describe("text helpers (#147)", () => {
  it("detects unchecked boxes and counts all boxes", () => {
    expect(hasUncheckedBoxes("- [ ] todo")).toBe(true);
    expect(hasUncheckedBoxes("- [x] done\n- [X] done")).toBe(false);
    expect(checkboxCount("- [ ] a\n- [x] b\n- [X] c")).toBe(3);
  });

  it("detects remaining-work phrasing and a final audit", () => {
    expect(mentionsRemainingWork("Still open in #99 (follow-up slices)")).toBe(true);
    expect(mentionsRemainingWork("Not closing — the rest belongs to #96")).toBe(true);
    expect(mentionsRemainingWork("All done and verified.")).toBe(false);
    expect(hasFinalAudit([COMPLETE_AUDIT])).toBe(true);
    expect(hasFinalAudit(["nice work"])).toBe(false);
  });

  it("lets a later final audit supersede older remaining-work comments", () => {
    const comments = ["First slice shipped. Issue stays open.", COMPLETE_AUDIT];
    expect(latestFinalAuditIndex(comments)).toBe(1);
    expect(
      evaluateIssueClosure({
        body: "- [x] done",
        comments,
        completionTracked: true,
        linkedPrCompletion: "complete"
      })
    ).toEqual({ allowed: true, violations: [] });
  });

  it("still blocks remaining-work comments posted after the final audit", () => {
    const result = evaluateIssueClosure({
      body: "- [x] done",
      comments: [COMPLETE_AUDIT, "Still open: one browser test remains."],
      completionTracked: true,
      linkedPrCompletion: "complete"
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/remaining work/i);
  });
});

describe("evaluateIssueClosure (#147)", () => {
  it("FIXTURE 1: a partial PR cannot close its (tracked) parent", () => {
    const result = evaluateIssueClosure({
      body: "- [x] done",
      comments: [COMPLETE_AUDIT],
      completionTracked: true,
      linkedPrCompletion: "partial"
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/partial/i);
  });

  it("FIXTURE 2: a tracked issue with unchecked requirements is rejected", () => {
    const result = evaluateIssueClosure({
      body: "## Scope\n- [x] first slice\n- [ ] the rest of the scope",
      comments: [COMPLETE_AUDIT],
      completionTracked: true,
      linkedPrCompletion: "complete"
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/unchecked/i);
  });

  it("FIXTURE 2b: a latest 'still open' comment blocks closure even with all boxes checked", () => {
    const result = evaluateIssueClosure({
      body: "- [x] done",
      comments: [COMPLETE_AUDIT, "Still open: the authenticated e2e."],
      completionTracked: true,
      linkedPrCompletion: "complete"
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/remaining work/i);
  });

  it("FIXTURE 2c: missing final audit blocks closure", () => {
    const result = evaluateIssueClosure({
      body: "- [x] done",
      comments: ["looks good"],
      completionTracked: true,
      linkedPrCompletion: "complete"
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/final closure audit/i);
  });

  it("FIXTURE 3: a fully audited tracked issue can close", () => {
    const result = evaluateIssueClosure({
      body: "## Acceptance\n- [x] a\n- [x] b",
      comments: ["progress note", COMPLETE_AUDIT],
      completionTracked: true,
      linkedPrCompletion: "complete"
    });
    expect(result).toEqual({ allowed: true, violations: [] });
  });

  it("FIXTURE 4: a focused one-PR bug issue closes normally (no audit required)", () => {
    const result = evaluateIssueClosure({
      body: "Repro + fix.\n- [ ] add regression test",
      comments: [],
      completionTracked: false,
      linkedPrCompletion: "complete"
    });
    expect(result).toEqual({ allowed: true, violations: [] });
  });

  it("FIXTURE 4b: even a focused issue is blocked when its closing PR is partial", () => {
    const result = evaluateIssueClosure({
      body: "Repro + fix.",
      comments: [],
      completionTracked: false,
      linkedPrCompletion: "partial"
    });
    expect(result.allowed).toBe(false);
  });
});

describe("evaluatePullRequestClosure (#147)", () => {
  const trackedIssue = {
    number: 120,
    title: "Complete string fundamentals from #79",
    labels: ["curriculum"],
    body: "- [ ] remaining item"
  };
  const focusedIssue = {
    number: 332,
    title: "Bug: raw Markdown renders in lessons",
    labels: [],
    body: "Focused bug."
  };

  it("requires completion status when a PR references tracked work", () => {
    const result = evaluatePullRequestClosure({
      body: "Part of #120\n\nAdds one slice.",
      referencedIssues: [trackedIssue]
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/completion status/i);
  });

  it("blocks a partial PR that uses a closing keyword", () => {
    const result = evaluatePullRequestClosure({
      body: "Completion status: partial\n\nFixes #120",
      referencedIssues: [trackedIssue]
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.join(" ")).toMatch(/partial/i);
  });

  it("keeps focused one-PR bug closures easy", () => {
    expect(
      evaluatePullRequestClosure({
        body: "Fixes #332",
        referencedIssues: [focusedIssue]
      })
    ).toEqual({ allowed: true, violations: [], completion: null });
  });
});
