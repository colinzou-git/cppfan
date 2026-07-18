import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #614: Run and Test must agree when an item becomes unavailable and must never
// execute or report a false zero-test success. The route 404s a never-existing
// item, so the reachable unavailable state is a mid-session removal: open a
// published item, delete it, then the action refuses in the real UI and the
// paired control is refused too.
//
// The workspace renders its run controls twice (wide + stacked responsive
// layouts); the wide instance is first in DOM and visible in every project, so
// locators are scoped to `.first()`.
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

      const controls = page.locator('[data-testid="code-controls"]').first();
      const runButton = controls.getByRole("button", { name: "Run", exact: true });
      const runTests = controls.getByRole("button", { name: "Run Tests" });
      await expect(runButton).toBeVisible();

      await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
      await page.evaluate(() => (window as EditorWindow).__cppfanCodeLabEditor!.setValue("int main(){ return 0; }"));

      // Remove the item mid-session (owner-authorized hard delete).
      await learner.removeContent(contentId);

      // Trigger an action while the control is still enabled. Prefer Test (its
      // failure mode — a false zero-test "pass" — is what #614 guards against).
      if ((await runTests.count()) && (await runTests.isEnabled())) {
        await runTests.click();
      } else {
        await runButton.click();
      }

      // The item is reported unavailable in the UI (never a normal result), and
      // the paired control agrees: both Run and Test are now refused (disabled).
      await expect(page.getByTestId("code-lab-item-unavailable").first()).toBeVisible();
      await expect(runButton).toBeDisabled();
    } finally {
      await learner.cleanup();
    }
  });
});
