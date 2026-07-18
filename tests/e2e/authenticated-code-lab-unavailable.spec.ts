import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #614: Run and Test must agree when an item becomes unavailable and must never
// execute or report a false zero-test success. The route 404s a never-existing
// item, so the reachable unavailable state is a mid-session removal: open a
// published item, delete it, then Run/Test refuse identically in the real UI.
//
// The workspace renders its run controls twice (wide + stacked responsive
// layouts), so locators are scoped to the currently visible controls.
//
// Requires the local Supabase stack; self-skips otherwise.

type EditorWindow = Window & { __cppfanCodeLabEditor?: { setValue(value: string): void } };

test.describe("authenticated code lab unavailable item (#614)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("Run and Test agree an item is unavailable after mid-session removal", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const { contentId, problemId } = await learner.seedPublishedInterviewProblem({ title: "PW unavailable problem" });

      const page = await context.newPage();
      await page.goto(`/lab/${encodeURIComponent(problemId)}`);

      // The visible run controls resolve and render while the item is available.
      const controls = page.locator('[data-testid="code-controls"]:visible');
      const runButton = controls.getByRole("button", { name: "Run", exact: true });
      await expect(runButton).toBeVisible();
      await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
      await page.evaluate(() => (window as EditorWindow).__cppfanCodeLabEditor!.setValue("int main(){ return 0; }"));

      // Remove the item mid-session (owner-authorized hard delete).
      await learner.removeContent(contentId);

      // Run refuses with the unavailable state — never a normal run result.
      await runButton.click();
      const unavailable = page.locator('[data-testid="code-lab-item-unavailable"]:visible');
      await expect(unavailable).toBeVisible();

      // Test refuses with the SAME signal — never a "tests passed" zero-test success.
      const runTests = controls.getByRole("button", { name: "Run Tests" });
      if (await runTests.count()) {
        await runTests.first().click();
        await expect(unavailable).toBeVisible();
        await expect(page.getByTestId("code-test-summary")).toHaveCount(0);
      }
    } finally {
      await learner.cleanup();
    }
  });
});
