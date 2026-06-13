import { expect, test } from "@playwright/test";

test("the dashboard shows the skill mastery preview or an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  const mastery = page.getByTestId("mastery-preview");
  await expect(mastery).toBeVisible();
  await expect(mastery.getByRole("heading", { name: /skill mastery/i })).toBeVisible();
  // Signed out (CI): the preview explains how mastery is built.
  await expect(mastery.getByText(/practicing to build|no mastery evidence yet/i)).toBeVisible();
});
