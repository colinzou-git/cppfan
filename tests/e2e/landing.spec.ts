import { expect, test } from "@playwright/test";

test("landing page shows cppFan product direction", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /learn c\+\+ and dsa/i })).toBeVisible();
  await expect(page.getByText(/FSRS-ready review scheduling/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open scaffold dashboard", exact: true })).toBeVisible();
});

test("dashboard route reaches scaffold or auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /dashboard scaffold/i });
  const loginHeading = page.getByRole("heading", { name: /sign in to cppFan/i });

  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (dashboardVisible) {
    await expect(dashboardHeading).toBeVisible();
    await expect(page.getByText(/Supabase is not configured yet/i)).toBeVisible();
    return;
  }

  await expect(loginHeading).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
