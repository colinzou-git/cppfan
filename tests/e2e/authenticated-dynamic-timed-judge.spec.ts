import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #608 slice 2: an owner runs the judge against a problem THEY authored.
//
// Before this slice, a `user.item.*` problem returned "not available" from the
// timed session. This proves the dynamic path end to end for a signed-in owner:
// publish a judge-backed user interview problem, open the timed session on it,
// and queue a judge run that reports the author's visible/hidden test counts.
//
// Requires the local Supabase stack; self-skips otherwise so the default e2e run
// is unaffected.

test.describe("authenticated dynamic timed-judge (#608)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("an owner queues a judge run on their published interview problem", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const { problemId } = await learner.seedPublishedInterviewProblem();

      const page = await context.newPage();
      await page.goto(`/interview/session?problem=${encodeURIComponent(problemId)}`);

      const runner = page.getByTestId("session-runner");
      await expect(runner).toBeVisible();

      // Provide a correct C++ solution and queue it for the dynamic judge suite.
      await page
        .getByTestId("session-code-draft")
        .fill("#include <iostream>\nint main(){ long a,b; std::cin>>a>>b; std::cout<<a+b<<'\\n'; }\n");

      const queue = page.getByTestId("session-submit-judge");
      await expect(queue).toBeEnabled();
      await queue.click();

      // The author's suite (1 visible + 1 hidden) is recognized and queued — not
      // "judge feedback is not available for this problem".
      await expect(page.getByTestId("session-judge-notice")).toContainText(
        /queued for \d+ visible and \d+ hidden tests/i
      );
    } finally {
      await learner.cleanup();
    }
  });
});
