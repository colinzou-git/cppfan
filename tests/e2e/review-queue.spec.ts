import { expect, test } from "@playwright/test";

test("the review queue opens", async ({ page }) => {
  await page.goto("/review");

  await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();

  const preview = page.getByTestId("review-preview");
  const queue = page.getByTestId("review-queue");
  const empty = page.getByTestId("review-empty");

  // Unauthenticated (CI / signed-out) shows the eligible-items preview; a
  // signed-in learner sees the due queue or the empty state.
  const previewVisible = await preview.isVisible().catch(() => false);

  if (previewVisible) {
    await expect(page.getByTestId("review-preview-item").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to review/i })).toBeVisible();
    return;
  }

  await expect(queue.or(empty)).toBeVisible();
});

test("the dashboard links to the review queue or shows an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  await page.getByRole("link", { name: "Review", exact: true }).click();
  await expect(page).toHaveURL(/\/review/);
  await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();
});
