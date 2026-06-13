import { expect, test } from "@playwright/test";

test("landing page shows cppFan product direction", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn c\+\+ and dsa/i })).toBeVisible();
  await expect(page.getByText(/FSRS review scheduling/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open dashboard", exact: true })).toBeVisible();
  // Stale scaffold wording must not return (#149).
  await expect(page.getByText(/scaffold/i)).toHaveCount(0);
});

test("dashboard route reaches the dashboard or auth/onboarding gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const loginHeading = page.getByRole("heading", { name: /sign in to cppFan/i });
  const onboardingHeading = page.getByRole("heading", { name: /onboarding/i });

  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (dashboardVisible) {
    await expect(dashboardHeading).toBeVisible();
    await expect(page.getByRole("link", { name: /review/i }).first()).toBeVisible();
    return;
  }

  const onboardingVisible = await onboardingHeading.isVisible().catch(() => false);

  if (onboardingVisible) {
    await expect(onboardingHeading).toBeVisible();
    return;
  }

  await expect(loginHeading).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
