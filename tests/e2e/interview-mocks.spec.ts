import { expect, test } from "@playwright/test";

// #182/#174: the timed mock-packs page renders the practice packs and is reachable
// from the interview catalog. Public study material — no auth, no database.

test("mock packs page renders practice packs with their problems", async ({ page }) => {
  await page.goto("/interview/mocks");

  const list = page.getByTestId("mock-packs");
  await expect(list).toBeVisible();
  const first = page.getByTestId("mock-pack").first();
  await expect(first).toBeVisible();
  // A pack shows its duration and at least one follow-up.
  await expect(first).toContainText(/min/);
  await expect(first).toContainText(/follow-up/i);
});

test("the interview catalog links to the mock packs", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("mock-packs-link").click();
  await expect(page).toHaveURL(/\/interview\/mocks$/);
  await expect(page.getByTestId("mock-packs")).toBeVisible();
});
