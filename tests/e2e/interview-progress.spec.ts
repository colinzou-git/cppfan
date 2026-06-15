import { expect, test } from "@playwright/test";

// #180: the weekly progress view aggregates recent evidence and surfaces the
// weakest dimensions. Signed-out (no evidence) it shows the empty state and the
// not-enough-evidence weakest message — never a fabricated history.

test("the interview catalog links to weekly progress", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("progress-link").click();
  await expect(page).toHaveURL(/\/interview\/progress$/);
  await expect(page.getByTestId("progress-weeks")).toBeVisible();
});

test("with no evidence the progress view shows the empty and not-enough-evidence states", async ({ page }) => {
  await page.goto("/interview/progress");

  await expect(page.getByTestId("progress-empty")).toBeVisible();
  await expect(page.getByTestId("progress-weakest-none")).toBeVisible();
  await expect(page.getByTestId("progress-empty")).toContainText(/log a practice outcome/i);
});
