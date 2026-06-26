import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";
import { interviewProblems, type InterviewProblem } from "@/features/interview/problem-catalog";
import { getJudgeIoDescription, getJudgeProblemSuite } from "@/features/interview/judge-test-suites";

/**
 * Interview-problem Code Lab configs (#444), keyed by interview problem id, so the
 * Interview page Code button opens the same full-page Code Lab (`/lab/<id>`) — and
 * its Debug tab — as labs and exercises. Pure data, client-readable: only visible
 * judge tests / display examples are exposed here, never hidden test I/O (those
 * stay in the server-only judge worker payloads; only the count is surfaced).
 */

function buildInterviewCodeLabPrompt(problem: InterviewProblem): string {
  const lines: string[] = [problem.prompt, "", `Constraints:`, problem.constraints, "", `Target complexity:`, problem.targetComplexity];

  if (problem.requiredEdgeCases.length > 0) {
    lines.push("", "Required edge cases:", ...problem.requiredEdgeCases.map((edge) => `- ${edge}`));
  }
  if (problem.clarifyingQuestions.length > 0) {
    lines.push("", "Clarifying questions to consider:", ...problem.clarifyingQuestions.map((q) => `- ${q}`));
  }
  if (problem.visibleExamples.length > 0) {
    lines.push(
      "",
      "Visible examples:",
      ...problem.visibleExamples.map(
        (example) => `- ${example.input} -> ${example.output}${example.note ? ` (${example.note})` : ""}`
      )
    );
  }
  const io = getJudgeIoDescription(problem.id);
  if (io) lines.push("", "Executable input/output contract:", io);

  return lines.join("\n");
}

function buildInterviewStarterCode(problem: InterviewProblem): string {
  const io = getJudgeIoDescription(problem.id);
  const contract = io ? `\n  // Executable I/O contract:\n${io.split("\n").map((l) => `  //   ${l}`).join("\n")}\n` : "";
  return `#include <bits/stdc++.h>
using namespace std;

int main() {${contract}
  // TODO: Read input according to the problem's executable contract.
  // TODO: Implement your solution.
  return 0;
}
`;
}

function normalizeExpectedStdout(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function buildInterviewVisibleTests(problem: InterviewProblem): CodeTestCase[] {
  // The judge suite's JudgeWorkerTest payloads deliberately omit raw stdin/stdout
  // (sanitized for the web), so visible tests come from the display examples.
  // matcher "trimmed" because interview examples are often conceptual, not exact
  // raw stdout. Hidden test I/O is never exposed here — only its count.
  return problem.visibleExamples.map((example, index) => ({
    name: `Example ${index + 1}`,
    stdin: example.input,
    expectedStdout: normalizeExpectedStdout(example.output),
    matcher: "trimmed"
  }));
}

function firstInterviewStdin(problem: InterviewProblem): string | undefined {
  return problem.visibleExamples.length > 0 ? problem.visibleExamples[0].input : undefined;
}

function resolveInterviewHiddenTestCount(problemId: string): number | undefined {
  const suite = getJudgeProblemSuite(problemId);
  return suite ? suite.hiddenTests.length : undefined;
}

export function buildInterviewCodeLabConfig(problem: InterviewProblem): LearningItemCodeLab {
  return {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: buildInterviewCodeLabPrompt(problem),
    starterCode: buildInterviewStarterCode(problem),
    stdin: firstInterviewStdin(problem),
    visibleTests: buildInterviewVisibleTests(problem),
    hiddenTestCount: resolveInterviewHiddenTestCount(problem.id),
    skillTags: [problem.primarySkillId, ...problem.secondarySkillIds],
    traceEnabled: true,
    predictionMode: "optional"
  };
}

export const INTERVIEW_CODE_LAB_CONFIGS: Record<string, LearningItemCodeLab> = Object.fromEntries(
  interviewProblems.map((problem) => [problem.id, buildInterviewCodeLabConfig(problem)])
);
