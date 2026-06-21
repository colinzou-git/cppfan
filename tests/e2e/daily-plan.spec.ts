import { expect, test } from "@playwright/test";

test("the dashboard shows review and goal learning sections or an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  const review = page.getByTestId("daily-review");
  await expect(review).toBeVisible();
  await expect(review.getByRole("heading", { name: /daily review/i })).toBeVisible();
  await expect(review.getByText(/previously learned practices scheduled by FSRS/i)).toBeVisible();

  const dailyNew = page.getByTestId("daily-new-for-goals");
  await expect(dailyNew).toBeVisible();
  await expect(dailyNew.getByRole("heading", { name: /daily new for goals/i })).toBeVisible();
  await expect(dailyNew.getByText(/FSRS reviews never appear here/i)).toBeVisible();

  await expect(page.getByTestId("mastery-preview")).toBeVisible();
  await expect(page.getByTestId("goals-entry")).toBeVisible();
  await expect(page.getByTestId("skill-map-preview")).toBeVisible();

  const sectionOrder = await page.locator([
    "[data-testid='daily-review']",
    "[data-testid='daily-new-for-goals']",
    "[data-testid='mastery-preview']",
    "[data-testid='goals-entry']",
    "[data-testid='skill-map-preview']"
  ].join(",")).evaluateAll((sections) => sections.map((section) => section.getAttribute("data-testid")));

  // #430 desktop layout: the main left column is Daily Review, Daily New, and the
  // Skill Map; mastery and goals move to the right-side panel (which renders after
  // the left column in the DOM). Mobile stacks the same source order.
  expect(sectionOrder).toEqual([
    "daily-review",
    "daily-new-for-goals",
    "skill-map-preview",
    "mastery-preview",
    "goals-entry"
  ]);
});
