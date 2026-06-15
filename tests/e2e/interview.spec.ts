import { expect, test } from "@playwright/test";

// #176/#174: the interview practice catalog renders the curated problems grouped
// by pattern. Public study material — no auth, no database.

test("interview catalog renders grouped problems", async ({ page }) => {
  await page.goto("/interview");

  const catalog = page.getByTestId("interview-catalog");
  await expect(catalog).toBeVisible();
  await expect(page.getByTestId("interview-group").first()).toBeVisible();
  await expect(page.getByTestId("interview-problem").first()).toBeVisible();

  // A problem card shows its target complexity and a hints disclosure.
  await expect(page.getByTestId("interview-problem").first()).toContainText(/target:/i);
});

test("the dashboard links to the interview catalog", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: /interview/i }).first().click();
  await expect(page).toHaveURL(/\/interview$/);
  await expect(page.getByTestId("interview-catalog")).toBeVisible();
});
