import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildJudgeSubmissionDraftFromSource } from "@/features/interview/judge-submission-builder";

const SOURCE = "#include <bits/stdc++.h>\nint main(){ std::cout << 0 << '\\n'; }\n";

describe("judge submission builder (#178)", () => {
  it("builds a validated draft from source without storing the raw source", () => {
    const built = buildJudgeSubmissionDraftFromSource({
      submissionId: "00000000-0000-4000-8000-000000000678",
      problemId: "iv.prefix.balance-returns-to-zero",
      source: SOURCE,
      compiler: "gcc",
      standard: "c++20",
      context: {
        mode: "practice",
        sourceVersion: 2,
        assistanceUsed: false,
        priorSolutionExposed: false
      }
    });

    expect(built.status).toBe("ok");
    if (built.status !== "ok") return;
    expect(built.visibleTestCount).toBe(2);
    expect(built.hiddenTestCount).toBe(2);
    expect(built.draft.submission).toMatchObject({
      problemId: "iv.prefix.balance-returns-to-zero",
      problemVersion: 1,
      compiler: "gcc",
      standard: "c++20",
      sourceBytes: Buffer.byteLength(SOURCE, "utf8")
    });
    expect(built.draft.submission.sourceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(built.draft)).not.toContain("#include");
  });

  it("rejects unsupported problems and invalid source", () => {
    expect(
      buildJudgeSubmissionDraftFromSource({
        submissionId: "00000000-0000-4000-8000-000000000679",
        problemId: "iv.graph.service-init-order",
        source: SOURCE,
        compiler: "gcc",
        standard: "c++20",
        context: { mode: "practice" }
      })
    ).toEqual({ status: "unsupported_problem" });

    expect(
      buildJudgeSubmissionDraftFromSource({
        submissionId: "00000000-0000-4000-8000-000000000680",
        problemId: "iv.prefix.balance-returns-to-zero",
        source: "",
        compiler: "gcc",
        standard: "c++20",
        context: { mode: "practice" }
      })
    ).toEqual({ status: "invalid", reason: "submission_limits_exceeded" });
  });

  it("keeps the server action free of compiler/worker execution imports", () => {
    const source = readFileSync("src/features/interview/judge-actions.ts", "utf8");
    expect(source).not.toMatch(/worker-runner|local-worker|docker-executor|process-launcher/);
    expect(source).not.toMatch(/runJudgeRequest|runLocalDockerJudge|createDockerExecutor/);
  });
});
