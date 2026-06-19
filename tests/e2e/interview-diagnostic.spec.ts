import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";
import { monitorBrowserErrors } from "./helpers/browser-errors";

// #175/#174: the baseline diagnostic overview lists the diagnostic sections and is
// reachable from the interview catalog. Read-only — no auth, no database.

test("diagnostic page lists the baseline sections", async ({ page }) => {
  await page.goto("/interview/diagnostic");

  const sections = page.getByTestId("diagnostic-sections");
  await expect(sections).toBeVisible();
  await expect(page.getByTestId("diagnostic-section").first()).toBeVisible();
  // The rating legend explains the per-area heat map (not a single pass/fail).
  await expect(page.getByText(/interview ready/i)).toBeVisible();
});

test("the interview catalog links to the diagnostic", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("diagnostic-link").click();
  await expect(page).toHaveURL(/\/interview\/diagnostic$/);
  await expect(page.getByTestId("diagnostic-sections")).toBeVisible();
});

test("rating a baseline area bands it live and saving signed-out prompts a sign-in", async ({ page }) => {
  await page.goto("/interview/diagnostic");

  const form = page.getByTestId("diagnostic-form");
  await expect(form).toBeVisible();

  const row = page.getByTestId("diagnostic-section-row").first();
  await expect(row).toHaveAttribute("data-level", "unrated");
  await row.getByTestId("diagnostic-rating-select").selectOption("4");
  await expect(row).toHaveAttribute("data-level", "interview_ready");

  await page.getByTestId("diagnostic-save").click();
  await expect(page.getByTestId("diagnostic-notice")).toContainText(/sign in/i);
});

test.describe("authenticated diagnostic result plan (#175)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("saved baseline renders a transparent 4-8 week plan after reload", async ({ page, context, baseURL }) => {
    const browserErrors = monitorBrowserErrors(page);
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    test.info().annotations.push({ type: "learner", description: learner.userId });

    try {
      await page.goto("/interview/diagnostic");
      for (const select of await page.getByTestId("diagnostic-rating-select").all()) {
        await select.selectOption("2");
      }
      await page.getByTestId("diagnostic-save").click();
      await expect(page.getByTestId("diagnostic-notice")).toContainText(/baseline saved/i);

      await page.reload();
      await expect(page.getByTestId("diagnostic-result-plan")).toBeVisible();
      await expect(page.getByTestId("diagnostic-plan-week")).toHaveCount(4);
      await expect(page.getByTestId("diagnostic-plan-link").first()).toHaveAttribute("href", /\/(exercises|interview)/);
      browserErrors.assertNoErrors();
    } finally {
      await learner.cleanup();
    }
  });
});
