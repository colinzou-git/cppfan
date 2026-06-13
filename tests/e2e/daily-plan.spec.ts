import { expect, test } from "@playwright/test";

test("the dashboard shows the daily plan or an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  const plan = page.getByTestId("daily-plan");
  await expect(plan).toBeVisible();
  await expect(plan.getByRole("heading", { name: /today's plan/i })).toBeVisible();

  // The plan always offers at least the exploration fallback, and links out.
  const items = plan.getByTestId("daily-plan-item");
  await expect(items.first()).toBeVisible();
  await expect(plan.getByText(/explore the skill map/i)).toBeVisible();
});
