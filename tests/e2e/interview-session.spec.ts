import { expect, test } from "@playwright/test";

// #177: the timed interview session runner. Signed-out it works locally (saving is
// a no-op) so the phase progression is exercised end to end without a database.

test("a practice session advances through phases and completes", async ({ page }) => {
  await page.goto("/interview/session");

  const runner = page.getByTestId("session-runner");
  await expect(runner).toBeVisible();
  await expect(page.getByTestId("session-status")).toContainText(/clarify the problem/i);

  await page.getByTestId("session-next").click();
  await expect(page.getByTestId("session-status")).toContainText(/work examples/i);

  await page.getByTestId("session-prev").click();
  await expect(page.getByTestId("session-status")).toContainText(/clarify the problem/i);

  await page.getByTestId("session-complete").click();
  await expect(runner).toHaveAttribute("data-status", "completed");
  await expect(page.getByTestId("session-restart")).toBeVisible();
});

test("the interview catalog links to a timed session", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("session-link").click();
  await expect(page).toHaveURL(/\/interview\/session$/);
  await expect(page.getByTestId("session-runner")).toBeVisible();
});
