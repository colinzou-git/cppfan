import { expect, test } from "@playwright/test";

test("dashboard shows the read-only C++ skill map preview or an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /dashboard scaffold/i });
  const loginHeading = page.getByRole("heading", { name: /sign in to cppFan/i });
  const onboardingHeading = page.getByRole("heading", { name: /onboarding/i });

  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (dashboardVisible) {
    const preview = page.getByTestId("skill-map-preview");
    await expect(preview).toBeVisible();
    await expect(preview.getByRole("heading", { name: /c\+\+ skill map preview/i })).toBeVisible();

    // Prerequisites must read as recommendations, never hard locks.
    await expect(preview.getByText(/recommendations, not hard locks/i)).toBeVisible();

    // The four seeded modules should all render.
    await expect(preview.getByRole("heading", { name: "Structs and classes" })).toBeVisible();
    await expect(preview.getByRole("heading", { name: "Constructors" })).toBeVisible();
    await expect(preview.getByRole("heading", { name: "RAII" })).toBeVisible();
    await expect(preview.getByRole("heading", { name: "Smart pointers" })).toBeVisible();

    // An early skill should be listed.
    await expect(preview.getByText("Struct/class syntax")).toBeVisible();
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
