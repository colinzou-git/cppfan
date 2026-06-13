import { expect, test } from "@playwright/test";

test("the project labs page lists guided projects with milestones", async ({ page }) => {
  await page.goto("/labs");

  await expect(page.getByRole("heading", { name: /project labs/i })).toBeVisible();

  const labs = page.getByTestId("project-lab");
  await expect(labs.first()).toBeVisible();
  expect(await labs.count()).toBeGreaterThan(1);

  await expect(page.getByRole("heading", { name: /flashcard reviewer/i })).toBeVisible();
});
