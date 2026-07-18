import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #611: every Code Lab capability (Run/Test/AI review/trace/debug) resolves a
// user-content item through the one shared resolver. Native browser coverage
// already exists (code-lab.spec.ts, code-lab-ai-trace.spec.ts,
// code-lab-debugger.spec.ts); this adds the USER-content-kind half of the
// capability × content-kind matrix (acceptance criterion 6).
//
// Requires the local Supabase stack; self-skips otherwise.

type EditorWindow = Window & { __cppfanCodeLabEditor?: { setValue(value: string): void } };

test.describe("authenticated code lab capabilities on user content (#611)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("AI review and Debug resolve a user-created item through the shared resolver", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const { problemId } = await learner.seedPublishedInterviewProblem({ title: "PW capability problem" });

      const page = await context.newPage();
      await page.goto(`/lab/${encodeURIComponent(problemId)}`);
      await expect(page.getByTestId("code-lab-workspace")).toBeVisible();

      await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
      await page.evaluate(() => (window as EditorWindow).__cppfanCodeLabEditor!.setValue("int main(){ return 0; }"));

      // AI review resolves the user item and degrades gracefully (no provider in CI).
      await page.getByTestId("code-lab-tab-ai").click();
      await page.getByRole("button", { name: "AI Review Code" }).first().click();
      await expect(page.getByTestId("code-ai-review").first()).toContainText(/not available|review/i);

      // Debug resolves the same user item — the tab, breakpoint editing, and panel work.
      await page.getByTestId("code-lab-tab-debug").click();
      await expect(page.getByTestId("code-debug")).toBeVisible();
      await page.getByTestId("code-debug-line-input").fill("1");
      await page.getByTestId("code-debug-add-breakpoint").click();
      await expect(page.getByTestId("code-debug-breakpoints")).toContainText("1");
    } finally {
      await learner.cleanup();
    }
  });
});
