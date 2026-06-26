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

test("signed-out, the page invites signing in to save progress", async ({ page }) => {
  await page.goto("/exercises");

  // Start/Complete are now real date columns (#472); signed-out shows the
  // save-progress note. Clicking Study still navigates to the Code Lab.
  await expect(page.getByTestId("exercise-signed-out-note")).toContainText(/sign in/i);
  await page.getByTestId("exercise-study").click();
  await expect(page).toHaveURL(/\/lab\/.+/);
});
