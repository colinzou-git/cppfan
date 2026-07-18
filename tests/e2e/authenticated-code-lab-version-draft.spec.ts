import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #612: Code Lab drafts are keyed by the immutable published content version.
// Republishing to a new version must NOT silently restore the old-version source,
// but the learner can explicitly copy the previous draft. This is the
// republish/resume browser coverage (acceptance criterion 8).
//
// The draft store persists to localStorage keyed by (item, contentVersionId), so
// the flow is deterministic within one browser context.
//
// Requires the local Supabase stack; self-skips otherwise.

type EditorWindow = Window & {
  __cppfanCodeLabEditor?: { setValue(value: string): void; getValue(): string };
};

const MARKER = "MARKER_VERSION_A_9c3f1a";

function editorValue() {
  return (window as EditorWindow).__cppfanCodeLabEditor!.getValue();
}

test.describe("authenticated code lab version-keyed drafts (#612)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("republish keeps the new version's editor clean and offers an explicit copy of the old draft", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const { contentId, problemId } = await learner.seedPublishedInterviewProblem({ title: "PW version problem" });

      const page = await context.newPage();
      await page.goto(`/lab/${encodeURIComponent(problemId)}`);
      await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
      await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));

      // Type a version-A draft and let it autosave (localStorage, keyed by version).
      await page.evaluate((m) => (window as EditorWindow).__cppfanCodeLabEditor!.setValue(m), MARKER);
      await page.waitForTimeout(1500); // > the 1000ms draft debounce

      // Republish -> a new immutable content version.
      await learner.republishInterviewProblem(contentId);

      // Reopen at the new version (same context, localStorage intact).
      await page.reload();
      await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
      await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));

      // The new version does NOT silently restore the old-version source.
      await expect.poll(() => page.evaluate(editorValue)).not.toContain(MARKER);

      // The prior-version draft is offered explicitly...
      const previous = page.getByTestId("code-lab-previous-draft").first();
      await expect(previous).toBeVisible();

      // ...and copying it restores the old draft into the editor.
      await previous.getByRole("button", { name: /copy code from previous version/i }).click();
      await expect.poll(() => page.evaluate(editorValue)).toContain(MARKER);
    } finally {
      await learner.cleanup();
    }
  });
});
