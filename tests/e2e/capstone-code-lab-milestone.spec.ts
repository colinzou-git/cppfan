import { expect, test } from "@playwright/test";

// #418/#431: an in-app capstone milestone shows a read-only code preview and a
// Code button to the full-screen /lab editor (editing/running moved off the
// list); a milestone without it keeps the existing UI. Runs signed-out, no AI.

test("an in-app milestone shows a code preview and a Code button to the full lab", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByTestId("capstone-tracks")).toBeVisible();

  const milestone = page.locator('[data-milestone-id="csv-table-summarizer.m1"]');
  await expect(milestone.getByTestId("milestone-code-preview")).toBeVisible();
  await expect(milestone.getByTestId("milestone-code-preview")).toContainText(/in-app code lab/i);

  const code = milestone.getByTestId("capstone-milestone-code");
  await expect(code).toBeVisible();
  await expect(code).toHaveAttribute("href", /\/lab\/csv-table-summarizer\.m1/);
});

test("a non-code milestone keeps the existing UI without a code preview", async ({ page }) => {
  await page.goto("/labs");
  const milestone = page.locator('[data-milestone-id="csv-table-summarizer.m2"]');
  await expect(milestone).toBeVisible();
  await expect(milestone.getByTestId("milestone-code-preview")).toHaveCount(0);
  await expect(milestone.getByTestId("capstone-milestone-code")).toHaveCount(0);
});
