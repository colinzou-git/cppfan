import { expect, test } from "@playwright/test";

test("the dashboard shows review and goal learning sections or an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  const review = page.getByTestId("daily-review");
  await expect(review).toBeVisible();
  await expect(review.getByRole("heading", { name: /daily review/i })).toBeVisible();
  await expect(review.getByText(/previously learned practices scheduled by FSRS/i)).toBeVisible();

  const dailyNew = page.getByTestId("daily-new-for-goals");
  await expect(dailyNew).toBeVisible();
  await expect(dailyNew.getByRole("heading", { name: /daily new for goals/i })).toBeVisible();
  await expect(dailyNew.getByText(/FSRS reviews never appear here/i)).toBeVisible();
});
