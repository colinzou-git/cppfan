import { expect, test } from "@playwright/test";

// #129: capstone track overview navigation. From /labs a learner can open a
// focused track page that lists that track's projects and milestones.

test("navigates from labs to a capstone track overview page", async ({ page }) => {
  await page.goto("/labs");

  const trackLink = page.getByTestId("capstone-track-link").first();
  await expect(trackLink).toBeVisible();
  await trackLink.click();

  await expect(page).toHaveURL(/\/labs\/tracks\//);
  await expect(page.getByTestId("track-title")).toBeVisible();
  // The track page shows the track's projects + milestones.
  await expect(page.getByTestId("capstone-project").first()).toBeVisible();
  await expect(page.getByTestId("capstone-milestone").first()).toBeVisible();
  // Prerequisites remain recommendations, never locks.
  await expect(page.getByTestId("capstone-tracks")).toContainText(/recommended first/i);
});

test("the track overview links back to all labs", async ({ page }) => {
  await page.goto("/labs/tracks/beginner_utility");
  await expect(page.getByTestId("track-title")).toBeVisible();
  await page.getByRole("link", { name: /all project labs/i }).click();
  await expect(page).toHaveURL(/\/labs$/);
});
