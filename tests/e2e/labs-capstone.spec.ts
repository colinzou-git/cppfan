import { expect, test } from "@playwright/test";

// #129/#130: the /labs capstone tracks UI renders structured tracks/projects/
// milestones, and (signed out) prompts to sign in to save progress. Persistence
// + cross-user isolation are covered by the authenticated integration suite.

test("labs shows capstone tracks with structured milestones", async ({ page }) => {
  await page.goto("/labs");

  const tracks = page.getByTestId("capstone-tracks");
  await expect(tracks).toBeVisible();
  await expect(page.getByTestId("capstone-track").first()).toBeVisible();
  await expect(page.getByTestId("capstone-milestone").first()).toBeVisible();

  // Prerequisites are shown as recommendations, not locks.
  await expect(tracks).toContainText(/recommended first/i);
});

test("signed-out, starting a milestone prompts to sign in", async ({ page }) => {
  await page.goto("/labs");

  await page.getByTestId("capstone-milestone-start").first().click();
  await expect(page.getByTestId("capstone-notice")).toContainText(/sign in/i);
});
