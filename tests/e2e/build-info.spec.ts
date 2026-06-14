import { expect, test } from "@playwright/test";

// #191: the deployed build identity must be visible from the UI on mobile and
// desktop, on the landing page and authenticated app pages, without dev tools.

test("build info footer is visible on the landing page (desktop)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const footer = page.getByTestId("build-info");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText(/cppFan v\d+\.\d+\.\d+/);
  await expect(footer).toContainText(/Built/);
});

test("build info footer is visible on a narrow iPhone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  await expect(page.getByTestId("build-info")).toBeVisible();
});

test("build info footer is present on an app route (dashboard or its auth gate)", async ({ page }) => {
  await page.goto("/dashboard");
  // The footer lives in the root layout, so it renders on the dashboard and on
  // the login/onboarding gate it redirects to.
  await expect(page.getByTestId("build-info")).toBeVisible();
});
