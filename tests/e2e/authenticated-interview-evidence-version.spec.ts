import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #661: manual readiness-evidence logging must list the owner's published
// user-created interview problems and persist the exact immutable published
// version (resolved server-side), not a client-supplied value.
//
// Requires the local Supabase stack; self-skips otherwise.

test.describe("authenticated interview evidence version attribution (#661)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires local Supabase");

  test("logs a user-created problem against its exact published version", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const seeded = await learner.seedPublishedInterviewProblem({ title: "Versioned evidence problem" });

      const page = await context.newPage();
      await page.goto("/interview/log");

      const select = page.getByTestId("evidence-problem");
      await expect(select.locator(`option[value="${seeded.problemId}"]`)).toContainText(
        "My content — Versioned evidence problem"
      );
      await select.selectOption(seeded.problemId);
      await page.getByTestId("evidence-save").click();
      await expect(page.getByTestId("evidence-notice")).toContainText("Logged");

      await expect
        .poll(async () => learner.latestInterviewEvidence(seeded.problemId))
        .toMatchObject({
          problem_id: seeded.problemId,
          content_version_id: seeded.publishedVersionId
        });
    } finally {
      await learner.cleanup();
    }
  });
});
