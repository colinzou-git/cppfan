import { expect, test } from "@playwright/test";

// #129/#130/#439: the /labs capstone tracks UI renders structured tracks with
// unified project cards (milestones as plain text), and (signed out) prompts to
// sign in to save project progress. Persistence + cross-user isolation are
// covered by the authenticated integration suite.

test("labs shows capstone tracks with unified project cards", async ({ page }) => {
  await page.goto("/labs");

  const tracks = page.getByTestId("capstone-tracks");
  await expect(tracks).toBeVisible();
  await expect(page.getByTestId("capstone-track").first()).toBeVisible();
  await expect(tracks.getByTestId("project-lab").first()).toBeVisible();
  await expect(tracks.getByTestId("project-milestone").first()).toBeVisible();

  // Prerequisites are shown as recommendations, not locks.
  await expect(tracks).toContainText(/recommended first/i);
});

test("signed-out, marking a project complete prompts to sign in", async ({ page }) => {
  await page.goto("/labs");

  await page.getByTestId("project-mark-complete").first().click();
  await expect(page.getByTestId("project-notice").first()).toContainText(
    /sign in to save project progress/i
  );
});
