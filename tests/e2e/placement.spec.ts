import { expect, test } from "@playwright/test";

// #125: the optional placement assessment renders from the curriculum seed and
// works signed-out (results returned, not persisted). The first placement item
// is the structs/classes default-access question whose correct answer is "Public".

test("taking the placement assessment shows per-module suggestions", async ({ page }) => {
  await page.goto("/placement");

  const form = page.getByTestId("placement-assessment");
  await expect(form).toBeVisible();
  await expect(page.getByTestId("placement-question-count")).toContainText("Showing 7 of 60");

  await page.getByTestId("placement-show-more").click();
  await expect(page.getByTestId("placement-question-count")).toContainText("Showing 14 of 60");

  // Answer the first question correctly; the rest stay unanswered (start here).
  await form.getByText("Public", { exact: true }).first().click();
  await page.getByTestId("placement-submit").click();

  const results = page.getByTestId("placement-results");
  await expect(results).toBeVisible();
  // The unanswered modules surface a "Start here" suggestion.
  await expect(results).toContainText(/start here/i);

  // Retake returns to the assessment.
  await page.getByTestId("placement-retake").click();
  await expect(page.getByTestId("placement-assessment")).toBeVisible();
});

test("placement can be skipped back to the dashboard", async ({ page }) => {
  await page.goto("/placement");
  await page.getByTestId("placement-skip").click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
