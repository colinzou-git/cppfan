import { expect, test } from "@playwright/test";

test("deadlock-safe transfer opens a full-page concurrency Code Lab", async ({ page }) => {
  await page.goto("/lab/concurrency-deadlock-safe-transfer");
  const workspace = page.getByTestId("code-lab-workspace");
  await expect(workspace).toBeVisible();
  await expect(page.getByTestId("code-editor")).toBeVisible();
  await expect(workspace).toContainText(/deadlock-safe account transfers/i);
});

test("cooperative jthread exercise exposes the C++20 starter editor", async ({ page }) => {
  await page.goto("/lab/concurrency-jthread-cancellation");
  const workspace = page.getByTestId("code-lab-workspace");
  await expect(workspace).toBeVisible();
  await expect(page.getByTestId("code-editor")).toBeVisible();
  await expect(workspace).toContainText(/cooperative jthread shutdown/i);
});
