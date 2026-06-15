import { expect, test } from "@playwright/test";

// #180: the study plan surfaces the pure target-date planner. Signed-out (no
// evidence) it shows the not-enough-evidence risk, a first evidence-building task,
// the week-by-week focus, and lets the learner switch the horizon.

test("the interview catalog links to the study plan", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("plan-link").click();
  await expect(page).toHaveURL(/\/interview\/plan$/);
  await expect(page.getByTestId("plan-next-task")).toBeVisible();
});

test("with no evidence the plan shows not-enough-evidence and a first task", async ({ page }) => {
  await page.goto("/interview/plan");

  await expect(page.getByTestId("plan-risk")).toHaveAttribute("data-risk", "not_enough_evidence");
  await expect(page.getByTestId("plan-next-task")).toHaveAttribute("data-session-type", "independent_timed");
  await expect(page.getByTestId("plan-week")).toHaveCount(6); // default horizon
});

test("switching the horizon recomputes the week-by-week focus", async ({ page }) => {
  await page.goto("/interview/plan");
  await page.locator('[data-testid="plan-weeks-option"][data-weeks="8"]').click();
  await expect(page).toHaveURL(/weeks=8/);
  await expect(page.getByTestId("plan-week")).toHaveCount(8);
});
