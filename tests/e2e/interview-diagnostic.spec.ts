import { expect, test } from "@playwright/test";

// #175/#174: the baseline diagnostic overview lists the diagnostic sections and is
// reachable from the interview catalog. Read-only — no auth, no database.

test("diagnostic page lists the baseline sections", async ({ page }) => {
  await page.goto("/interview/diagnostic");

  const sections = page.getByTestId("diagnostic-sections");
  await expect(sections).toBeVisible();
  await expect(page.getByTestId("diagnostic-section").first()).toBeVisible();
  // The rating legend explains the per-area heat map (not a single pass/fail).
  await expect(page.getByText(/interview ready/i)).toBeVisible();
});

test("the interview catalog links to the diagnostic", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("diagnostic-link").click();
  await expect(page).toHaveURL(/\/interview\/diagnostic$/);
  await expect(page.getByTestId("diagnostic-sections")).toBeVisible();
});

test("rating a baseline area bands it live and saving signed-out prompts a sign-in", async ({ page }) => {
  await page.goto("/interview/diagnostic");

  const form = page.getByTestId("diagnostic-form");
  await expect(form).toBeVisible();

  const row = page.getByTestId("diagnostic-section-row").first();
  await expect(row).toHaveAttribute("data-level", "unrated");
  await row.getByTestId("diagnostic-rating-select").selectOption("4");
  await expect(row).toHaveAttribute("data-level", "interview_ready");

  await page.getByTestId("diagnostic-save").click();
  await expect(page.getByTestId("diagnostic-notice")).toContainText(/sign in/i);
});
