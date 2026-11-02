import { expect, test } from "@playwright/test";

test("concurrency reasoning items render and grade through the normal choice flow", async ({ page }) => {
  await page.goto("/learn/cpp.concurrency.data_races.reasoning_lost_update");

  const item = page.getByTestId("learning-item");
  await expect(item.getByRole("heading", { name: "Trace a lost increment" })).toBeVisible();
  await expect(item.getByTestId("learning-item-type")).toHaveText(/code reading/i);
  await page.getByRole("radio", { name: /final value can be 1/i }).check();
  await page.getByTestId("answer-submit").click();
  await expect(page.getByTestId("answer-result")).toContainText("Correct!");
  await expect(item).toContainText(/undefined behavior/i);

  await page.goto("/learn/cpp.concurrency.condition_variables.reasoning_shutdown_notify");
  await expect(page.getByTestId("learning-item-type")).toHaveText(/bug spotting/i);
  await expect(page.getByText(/three consumers wait/i)).toBeVisible();
});

test("concurrency code and trace text stays within a mobile page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/cpp.concurrency.deadlock.reasoning_wait_cycle");
  await expect(page.getByRole("heading", { name: "Trace a two-lock deadlock" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
