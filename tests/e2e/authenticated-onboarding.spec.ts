import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";
import { monitorBrowserErrors } from "./helpers/browser-errors";

test.describe("authenticated onboarding and profile (#99)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("a new learner completes onboarding, edits the profile, and keeps the saved values", async ({
    page,
    context,
    baseURL
  }) => {
    const browserErrors = monitorBrowserErrors(page);
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000", {
      completeOnboarding: false
    });
    test.info().annotations.push({ type: "learner", description: learner.userId });

    try {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/onboarding\?next=%2Fdashboard/);
      await expect(page.getByRole("heading", { name: /onboarding/i })).toBeVisible();

      await page.getByLabel("Display name").fill("Browser Learner");
      await page.getByRole("radio", { name: /Some C\+\+/i }).check();
      await page.getByRole("checkbox", { name: /RAII, ownership, and smart pointers/i }).check();
      await page.getByRole("checkbox", { name: /^iPad$/i }).check();
      await page.getByLabel("New skills per day").fill("3");
      await page.getByLabel("Review minutes per day").fill("25");
      await page.getByRole("button", { name: /finish onboarding/i }).click();

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole("heading", { name: /your learning dashboard/i })).toBeVisible();
      await expect(page.getByText("Welcome, Browser Learner")).toBeVisible();
      await expect(page.getByText(/Daily new skills:\s*3/i)).toBeVisible();
      await expect(page.getByText(/Review minutes:\s*25/i)).toBeVisible();

      await page.getByRole("link", { name: "Profile", exact: true }).click();
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.getByLabel("Display name")).toHaveValue("Browser Learner");
      await expect(page.getByRole("radio", { name: /Some C\+\+/i })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: /RAII, ownership, and smart pointers/i })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: /^iPad$/i })).toBeChecked();
      await expect(page.getByLabel("New skills per day")).toHaveValue("3");
      await expect(page.getByLabel("Review minutes per day")).toHaveValue("25");

      await page.getByLabel("Display name").fill("Browser Learner Updated");
      await page.getByLabel("New skills per day").fill("4");
      await page.getByLabel("Review minutes per day").fill("30");
      await page.getByRole("button", { name: /save profile/i }).click();

      await expect(page).toHaveURL(/\/profile\?message=saved/);
      await expect(page.getByText("Profile saved.")).toBeVisible();
      await expect(page.getByLabel("Display name")).toHaveValue("Browser Learner Updated");
      await expect(page.getByLabel("New skills per day")).toHaveValue("4");
      await expect(page.getByLabel("Review minutes per day")).toHaveValue("30");

      await page.reload();
      await expect(page.getByLabel("Display name")).toHaveValue("Browser Learner Updated");
      await expect(page.getByLabel("New skills per day")).toHaveValue("4");
      await expect(page.getByLabel("Review minutes per day")).toHaveValue("30");
      browserErrors.assertNoErrors();
    } finally {
      await learner.cleanup();
    }
  });
});
