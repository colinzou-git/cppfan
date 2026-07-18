import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #613: eligible user-created interview problems participate in personal mock
// packs alongside native problems, and the saved pack links open the exact
// selected problem. This exercises the authenticated compose -> persist -> display
// path in a real browser (no code execution required).
//
// Requires the local Supabase stack; self-skips otherwise.

test.describe("authenticated personal mock packs (#613)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("compose and persist a pack mixing a native and a custom problem", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const { contentId } = await learner.seedPublishedInterviewProblem({ title: "PW custom mock problem" });

      const page = await context.newPage();
      await page.goto("/interview/mocks");

      const composer = page.getByTestId("personal-mock-composer");
      await expect(composer).toBeVisible();

      // The owner's published custom problem is selectable and badged "Custom".
      const customRow = composer.locator("label", { hasText: "PW custom mock problem" });
      await expect(customRow).toContainText("Custom");
      await customRow.getByRole("checkbox").check();

      // Mix in a native catalog problem.
      await composer.locator("label", { hasText: "Native" }).first().getByRole("checkbox").check();

      await composer.getByPlaceholder("e.g. Graphs + DP warmup").fill("PW mixed pack");
      await composer.getByRole("button", { name: /save pack/i }).click();
      await expect(composer).toContainText("Saved.");

      // The saved pack is persisted, displayed, mixes both sources, and its custom
      // item links to the exact selected problem (criteria 3 + 4).
      const pack = page
        .getByTestId("personal-mock-packs")
        .getByTestId("personal-mock-pack")
        .filter({ hasText: "PW mixed pack" });
      await expect(pack).toContainText("PW custom mock problem");
      await expect(pack).toContainText("Custom");
      await expect(pack).toContainText("Native");
      await expect(pack.getByRole("link", { name: "PW custom mock problem" })).toHaveAttribute(
        "href",
        new RegExp(contentId)
      );
    } finally {
      await learner.cleanup();
    }
  });
});
