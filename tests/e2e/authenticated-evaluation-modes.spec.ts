import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #609: learner-side evaluation workflows. Two modes need no runner/AI to verify
// their contract honestly in CI:
//   - self_evaluation: an explicit structured confirmation credits completion;
//   - ai_evaluation with no configured provider: a retryable "unavailable"
//     outcome that NEVER fabricates a pass.
// (The objective judge/combined modes are covered by the Run/Test and dynamic
// judge browser suites plus the combination-logic unit tests.)
//
// Requires the local Supabase stack; self-skips otherwise.

test.describe("authenticated learner evaluation modes (#609)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("self-evaluation credits completion and ai-evaluation stays unavailable (no false pass)", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      // Self-evaluation: structured confirmation is the authoritative completion.
      const selfItem = await learner.seedPublishedInterviewProblem({
        title: "PW self-eval problem",
        evaluationMode: "self_evaluation"
      });
      const selfPage = await context.newPage();
      await selfPage.goto(`/lab/${encodeURIComponent(selfItem.problemId)}`);
      const selfPanel = selfPage.getByTestId("self-evaluation-panel").first();
      await expect(selfPanel).toBeVisible();
      await selfPanel.getByRole("radio", { name: /confident this is complete/i }).check();
      await selfPanel.getByRole("textbox").fill("I checked the required edge cases.");
      await selfPanel.getByRole("button", { name: /submit evaluation/i }).click();
      await expect(selfPage.getByTestId("self-evaluation-result").first()).toBeVisible();

      // AI evaluation with no provider (CI default): retryable unavailable, never a pass.
      const aiItem = await learner.seedPublishedInterviewProblem({
        title: "PW ai-eval problem",
        evaluationMode: "ai_evaluation"
      });
      const aiPage = await context.newPage();
      await aiPage.goto(`/lab/${encodeURIComponent(aiItem.problemId)}`);
      const aiPanel = aiPage.getByTestId("ai-evaluation-panel").first();
      await expect(aiPanel).toBeVisible();
      await aiPanel.getByRole("button", { name: /submit for evaluation/i }).click();
      await expect(aiPage.getByTestId("ai-evaluation-result").first()).toContainText(/unavailable|temporarily/i);
    } finally {
      await learner.cleanup();
    }
  });
});
