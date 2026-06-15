import { expect, test } from "@playwright/test";

// #179: the rubric self-review lets the learner score each dimension separately
// and shows a live heat map, category averages, and remediation. Read-only for
// signed-out users (the local view works; saving prompts to sign in).

test("the interview catalog links to the rubric self-review", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("rubric-link").click();
  await expect(page).toHaveURL(/\/interview\/rubric$/);
  await expect(page.getByTestId("rubric-review")).toBeVisible();
});

test("scoring a weak dimension surfaces a live band and remediation", async ({ page }) => {
  await page.goto("/interview/rubric");

  const criterion = page.locator('[data-testid="rubric-criterion"][data-criterion-id="communication"]');
  await criterion.getByTestId("rubric-score-select").selectOption("1");

  // The criterion is banded live and shows up as a focus area.
  await expect(criterion).toHaveAttribute("data-band", "needs_work");
  await expect(page.getByTestId("rubric-categories")).toBeVisible();
  const remediation = page.locator('[data-testid="rubric-remediation-item"][data-criterion-id="communication"]');
  await expect(remediation).toBeVisible();

  // Saving without a session prompts the learner to sign in (no crash).
  await page.getByTestId("rubric-save").click();
  await expect(page.getByTestId("rubric-notice")).toBeVisible();
});
