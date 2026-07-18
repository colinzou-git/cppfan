/*
 * Dynamic judge-definition resolver for timed interview submissions (#608).
 *
 * A judge submission needs a server/worker-held executable definition: the
 * ordered worker tests (id + category + fixtureHash, never raw I/O) plus the
 * matching fixtures (stdin + expected output) that stay server/worker-only. This
 * resolves that definition for BOTH native catalog problems and an authenticated
 * owner's published user interview problem (`user.item.<contentId>`), so a
 * learner can run the judge against a problem they authored — the missing half of
 * #608.
 *
 * Identity is version-aware (#612): the immutable published `contentVersionId`
 * (user_content_versions.id) is the publication identity, NOT the payload's
 * `schemaVersion` (which stays 1 across republications). When the caller pins an
 * expected version and the owner has since republished, the definition is
 * reported `stale_definition` rather than silently judged against a new suite.
 *
 * Server-only. Raw stdin/expected output never leaves as part of a learner-facing
 * value — callers persist fixtures only into the private worker payload table.
 */

import { getInterviewProblem } from "./problem-catalog";
import { getJudgeProblemSuite } from "./judge-test-suites";
import { fixtureHashFor } from "./judge-fixture";
import { getInterviewForOwner } from "@/features/user-content/user-content-queries";
import { contentIdFromUserItemId, isUserLearningItemId } from "@/features/user-content/user-content-id";
import { INTERVIEW_LIMITS, type ExerciseTest, type InterviewProblemPayload } from "@/features/user-content/interview-content-types";
import type { JudgeWorkerTest } from "../../../services/interview-judge/protocol";
import type { JudgeFixture } from "../../../services/interview-judge/worker-runner";

export type JudgeDefinitionSource = "native" | "user";

/**
 * A resolved, executable judge definition. `visibleTests`/`hiddenTests` carry no
 * raw I/O; `fixtures` (stdin + expected) are worker-only and must never be
 * serialized into a learner-facing response or log.
 */
export type ResolvedJudgeDefinition = {
  problemId: string;
  source: JudgeDefinitionSource;
  /** Numeric native/author problem version — diagnostic, not publication identity. */
  problemVersion: number;
  /** Immutable published version (user_content_versions.id); null for native. */
  contentVersionId: string | null;
  ioDescription: string;
  visibleTests: JudgeWorkerTest[];
  hiddenTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
};

export type ResolveInterviewJudgeDefinitionResult =
  | { status: "ok"; definition: ResolvedJudgeDefinition }
  | { status: "not_found" }
  | { status: "evaluation_not_judge_backed" }
  | { status: "stale_definition"; publishedVersionId: string | null }
  | { status: "invalid_suite"; reason: string };

const MAX_CATEGORY_LENGTH = 40;
const MAX_TEST_NAME_LENGTH = 200;

// Author evaluation modes that produce an objective judge suite. `ai_evaluation`
// and `self_evaluation` are graded elsewhere and have no executable suite.
const JUDGE_BACKED_MODES = new Set<InterviewProblemPayload["evaluationMode"]>(["judge", "judge_plus_ai"]);

function nativeDefinition(problemId: string): ResolveInterviewJudgeDefinitionResult {
  const problem = getInterviewProblem(problemId);
  const suite = getJudgeProblemSuite(problemId);
  if (!problem || !suite) {
    return { status: "not_found" };
  }
  return {
    status: "ok",
    definition: {
      problemId,
      source: "native",
      problemVersion: suite.version,
      contentVersionId: null,
      ioDescription: suite.ioDescription,
      visibleTests: suite.visibleTests,
      hiddenTests: suite.hiddenTests,
      fixtures: suite.fixtures
    }
  };
}

function boundedCategory(hidden: boolean): string {
  return (hidden ? "hidden" : "visible").slice(0, MAX_CATEGORY_LENGTH);
}

function isValidTest(test: unknown): test is ExerciseTest {
  if (!test || typeof test !== "object") {
    return false;
  }
  const candidate = test as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.input === "string" &&
    typeof candidate.expectedOutput === "string" &&
    typeof candidate.hidden === "boolean"
  );
}

/**
 * Convert an author's published tests into worker tests + worker-only fixtures.
 * Test ids are deterministic by position so they stay stable across republication
 * of the same version; a duplicate id (defensive) or malformed/empty/over-limit
 * suite is rejected as `invalid_suite` rather than sent to the worker.
 */
function userSuiteFromPayload(
  payload: InterviewProblemPayload
): { visibleTests: JudgeWorkerTest[]; hiddenTests: JudgeWorkerTest[]; fixtures: JudgeFixture[] } | { error: string } {
  const tests = payload.tests;
  if (!Array.isArray(tests) || tests.length === 0) {
    return { error: "no_tests" };
  }
  if (tests.length > INTERVIEW_LIMITS.maxTests) {
    return { error: "too_many_tests" };
  }

  const visibleTests: JudgeWorkerTest[] = [];
  const hiddenTests: JudgeWorkerTest[] = [];
  const fixtures: JudgeFixture[] = [];
  const seenIds = new Set<string>();

  for (let index = 0; index < tests.length; index += 1) {
    const test = tests[index];
    if (!isValidTest(test)) {
      return { error: "malformed_test" };
    }
    const testId = `case-${index + 1}`;
    if (seenIds.has(testId)) {
      return { error: "duplicate_test_id" };
    }
    seenIds.add(testId);

    const workerTest: JudgeWorkerTest = {
      id: testId,
      name: test.name.slice(0, MAX_TEST_NAME_LENGTH),
      hidden: test.hidden,
      category: boundedCategory(test.hidden),
      fixtureHash: fixtureHashFor(test.input, test.expectedOutput)
    };
    (test.hidden ? hiddenTests : visibleTests).push(workerTest);
    fixtures.push({ testId, stdin: test.input, expectedStdout: test.expectedOutput });
  }

  return { visibleTests, hiddenTests, fixtures };
}

async function userDefinition(
  problemId: string,
  expectedContentVersionId?: string | null
): Promise<ResolveInterviewJudgeDefinitionResult> {
  const contentId = contentIdFromUserItemId(problemId);
  if (!contentId) {
    return { status: "not_found" };
  }
  const detail = await getInterviewForOwner(contentId);
  const payload = detail?.publishedPayload;
  const publishedVersionId = detail?.publishedVersionId ?? null;
  if (!payload || !publishedVersionId) {
    return { status: "not_found" };
  }

  // Publication identity is the immutable content version, never schemaVersion.
  if (expectedContentVersionId != null && expectedContentVersionId !== publishedVersionId) {
    return { status: "stale_definition", publishedVersionId };
  }

  if (!JUDGE_BACKED_MODES.has(payload.evaluationMode)) {
    return { status: "evaluation_not_judge_backed" };
  }

  const suite = userSuiteFromPayload(payload);
  if ("error" in suite) {
    return { status: "invalid_suite", reason: suite.error };
  }

  return {
    status: "ok",
    definition: {
      problemId,
      source: "user",
      problemVersion: payload.schemaVersion ?? 1,
      contentVersionId: publishedVersionId,
      ioDescription: payload.constraints ?? "",
      visibleTests: suite.visibleTests,
      hiddenTests: suite.hiddenTests,
      fixtures: suite.fixtures
    }
  };
}

/**
 * Resolve the executable judge definition for a native or user interview problem.
 * When `expectedContentVersionId` is supplied for a user problem and the owner has
 * republished, returns `stale_definition` so the caller can refuse to judge
 * against a suite the learner never saw.
 */
export async function resolveInterviewJudgeDefinition(input: {
  problemId: string;
  expectedContentVersionId?: string | null;
}): Promise<ResolveInterviewJudgeDefinitionResult> {
  const problemId = input.problemId;
  if (typeof problemId !== "string" || problemId.length === 0) {
    return { status: "not_found" };
  }
  if (!isUserLearningItemId(problemId)) {
    return nativeDefinition(problemId);
  }
  return userDefinition(problemId, input.expectedContentVersionId);
}
