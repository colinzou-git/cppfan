import { expect, test } from "@playwright/test";

// #418: a capstone milestone with Code Lab metadata renders the Code Lab in-app
// and can run its visible tests; a milestone without it keeps the existing UI.
// Runs signed-out, mock runner, no AI.

test("an in-app milestone renders the Code Lab and runs its tests", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByTestId("capstone-tracks")).toBeVisible();

  const milestone = page.locator('[data-milestone-id="csv-table-summarizer.m1"]');
  await expect(milestone.getByTestId("code-lab-milestone")).toBeVisible();
  await expect(milestone.getByTestId("code-lab-milestone")).toContainText(/in-app code lab/i);
  await expect(milestone.getByTestId("code-editor")).toBeVisible();

  await milestone.getByRole("button", { name: "Run Tests" }).click();
  await expect(milestone.getByTestId("code-test-summary")).toContainText("tests passed");
});

test("a non-code milestone keeps the existing UI without a Code Lab", async ({ page }) => {
  await page.goto("/labs");
  const milestone = page.locator('[data-milestone-id="csv-table-summarizer.m2"]');
  await expect(milestone).toBeVisible();
  await expect(milestone.getByTestId("code-lab-milestone")).toHaveCount(0);
});
