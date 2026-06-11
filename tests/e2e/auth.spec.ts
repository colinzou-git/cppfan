import { expect, test } from "@playwright/test";

test("login page exposes Google and email auth options", async ({ page }) => {
  await page.goto("/login?next=/dashboard");

  await expect(page.getByRole("heading", { name: /sign in to cppFan/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await expect(page.getByLabel(/email magic link/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
  await expect(page.getByText(/Next redirect:/i)).toBeVisible();
});

test("auth callback without code returns to login with error", async ({ page }) => {
  await page.goto("/auth/callback?next=/dashboard");

  await expect(page).toHaveURL(/\/login\?error=missing-code/);
  await expect(page.getByRole("heading", { name: /sign in to cppFan/i })).toBeVisible();
  await expect(page.getByText(/Auth error: missing-code/i)).toBeVisible();
});
