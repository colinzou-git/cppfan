import { expect, test } from "@playwright/test";

test("interview catalog links to the separate target settings", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("target-profile-link").click();
  await expect(page).toHaveURL(/\/interview\/target$/);
  await expect(page.getByRole("heading", { name: "Interview target" })).toBeVisible();
  await expect(page.getByTestId("interview-target-form")).toBeVisible();
});

test("diagnostic exposes a retake-history area", async ({ page }) => {
  await page.goto("/interview/diagnostic");
  await expect(page.getByTestId("diagnostic-history")).toBeVisible();
  await expect(page.getByTestId("diagnostic-form")).toBeVisible();
  await expect(page.getByTestId("diagnostic-rating-select")).toHaveCount(4);
});
