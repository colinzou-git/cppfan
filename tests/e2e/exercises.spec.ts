import { expect, test } from "@playwright/test";

// #128/#447: the /exercises write-code catalog renders as a grouped accordion and
// (signed out) prompts to sign in to save progress. Persistence + cross-user
// isolation are covered by the authenticated integration suite.

test("exercises catalog renders grouped rows with a detail panel", async ({ page }) => {
  await page.goto("/exercises");

  const catalog = page.getByTestId("exercise-catalog");
  await expect(catalog).toBeVisible();
  await expect(page.getByTestId("exercise-group-row").first()).toBeVisible();
  // The shared detail panel shows the selected exercise + a Study button.
  await expect(page.getByTestId("exercise-detail")).toBeVisible();
  await expect(page.getByTestId("exercise-study")).toBeVisible();
});

test("signed-out, starting an exercise prompts to sign in", async ({ page }) => {
  await page.goto("/exercises");

  // The first group is expanded by default; start its first child exercise.
  await page.getByTestId("exercise-start").first().click();
  await expect(page.getByTestId("exercise-notice")).toContainText(/sign in/i);
});
