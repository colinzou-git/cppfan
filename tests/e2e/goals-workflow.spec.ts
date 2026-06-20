import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

test.describe("authenticated Goals workflow (#269)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("preserves an Evaluation round-trip draft, creates alongside another goal, and revises immutably", async ({ page, context, baseURL }) => {
    test.setTimeout(90_000);
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    try {
      await learner.createStudyGoal({ title: "Existing DSA goal", skillId: "dsa.arrays.indexing", skillTitle: "Array indexing" });
      await page.goto("/goals");
      await expect(page.getByTestId("goal-wizard")).toBeVisible();
      await expect(page.getByLabel("Goal duration")).toHaveValue("7");

      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByLabel("Goal title").fill("C++ foundations sprint");
      await page.getByLabel("Skills").selectOption(["cpp.program_basics.structure"]);
      await page.getByRole("button", { name: "Back" }).click();
      await page.getByRole("link", { name: /30-question Evaluation/i }).click();
      await expect(page.getByRole("heading", { name: "Goal Evaluation" })).toBeVisible();
      await page.goBack();
      await expect(page.getByText(/saved draft was restored/i)).toBeVisible();
      await page.getByRole("button", { name: "Continue" }).click();
      await expect(page.getByLabel("Goal title")).toHaveValue("C++ foundations sprint");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("button", { name: "Create goal" }).click();

      await expect(page.getByText("C++ foundations sprint")).toBeVisible();
      await expect(page.getByText("Existing DSA goal")).toBeVisible();
      await page.getByRole("article").filter({ hasText: "C++ foundations sprint" })
        .getByRole("link", { name: /Details and update/i }).click();
      await expect(page.getByRole("heading", { name: "Revision timeline" })).toBeVisible();
      await page.getByLabel("Title").fill("C++ foundations sprint revised");
      await page.getByRole("button", { name: "Save new revision" }).click();
      await expect(page.getByText("C++ foundations sprint revised")).toBeVisible();
      await expect(page.getByText(/Revision 2/)).toBeVisible();
    } finally {
      await learner.cleanup();
    }
  });
});
