import { expect, test } from "@playwright/test";

// #128: the /exercises write-code catalog renders, shows launch instructions, and
// (signed out) prompts to sign in to save progress. Persistence + cross-user
// isolation are covered by the authenticated integration suite.

test("exercises catalog renders cards with launch instructions", async ({ page }) => {
  await page.goto("/exercises");

  const catalog = page.getByTestId("exercise-catalog");
  await expect(catalog).toBeVisible();
  await expect(page.getByTestId("exercise-card").first()).toBeVisible();

  // Instructions are expandable and explain the Codespaces/test workflow.
  await page.getByTestId("exercise-instructions-toggle").first().click();
  const instructions = page.getByTestId("exercise-instructions").first();
  await expect(instructions).toBeVisible();
  await expect(instructions).toContainText(/scripts\/exercises\/test\.sh/);
});

test("signed-out, starting an exercise prompts to sign in", async ({ page }) => {
  await page.goto("/exercises");

  await page.getByTestId("exercise-start").first().click();
  await expect(page.getByTestId("exercise-notice")).toContainText(/sign in/i);
});
