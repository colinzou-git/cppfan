import { expect, test } from "@playwright/test";

test("onboarding route shows profile form or auth gate", async ({ page }) => {
  await page.goto("/onboarding?next=/dashboard");

  const onboardingHeading = page.getByRole("heading", { name: /onboarding/i });
  const loginHeading = page.getByRole("heading", { name: /sign in to cppFan/i });

  const onboardingVisible = await onboardingHeading.isVisible().catch(() => false);

  if (onboardingVisible) {
    await expect(onboardingHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: /set up your cppFan profile/i })).toBeVisible();
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await expect(page.getByTestId("interview-target-profile-link")).toBeVisible();
    await expect(page.getByRole("button", { name: /finish onboarding/i })).toBeVisible();
    return;
  }

  await expect(loginHeading).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("profile route shows setup guidance or auth gate", async ({ page }) => {
  await page.goto("/profile");

  const profileHeading = page.getByRole("heading", { name: /^profile$/i });
  const loginHeading = page.getByRole("heading", { name: /sign in to cppFan/i });
  const onboardingHeading = page.getByRole("heading", { name: /onboarding/i });

  const profileVisible = await profileHeading.isVisible().catch(() => false);

  if (profileVisible) {
    await expect(profileHeading).toBeVisible();
    await expect(page.getByRole("heading", { name: /profile settings/i })).toBeVisible();
    await expect(page.getByTestId("interview-target-profile-link")).toBeVisible();
    return;
  }

  const onboardingVisible = await onboardingHeading.isVisible().catch(() => false);

  if (onboardingVisible) {
    await expect(onboardingHeading).toBeVisible();
    return;
  }

  await expect(loginHeading).toBeVisible();
});
