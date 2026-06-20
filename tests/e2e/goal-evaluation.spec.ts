import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

test.describe("authenticated adaptive Goal Evaluation (#267)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("completes 30 questions, resumes the persisted item, and refreshes goal suggestions", async ({
    page,
    context,
    baseURL
  }) => {
    test.setTimeout(120_000);
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    test.info().annotations.push({ type: "learner", description: learner.userId });

    try {
      await page.goto("/goals/evaluation");
      await page.getByTestId("goal-evaluation-start").click();
      await expect(page.getByTestId("goal-evaluation-progress")).toHaveText("Question 1 of 30");
      const activeA11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(activeA11y.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")))
        .toEqual([]);

      for (let question = 1; question <= 30; question += 1) {
        const prompt = await page.locator("fieldset legend").textContent();
        if (question === 2) {
          await page.reload();
          await expect(page.getByTestId("goal-evaluation-progress")).toHaveText("Question 2 of 30");
          await expect(page.locator("fieldset legend")).toHaveText(prompt ?? "");
        }

        await page.getByRole("radio").first().check();
        await page.getByTestId("goal-evaluation-submit").click();
        if (question < 30) {
          await expect(page.getByTestId("goal-evaluation-progress"))
            .toHaveText(`Question ${question + 1} of 30`);
          await expect(page.getByRole("status")).not.toContainText(/correct|incorrect|answer key/i);
        }
      }

      await expect(page.getByTestId("goal-evaluation-complete")).toBeVisible();
      await expect(page.getByText(/recommendations only/i)).toBeVisible();
      const completedA11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(completedA11y.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")))
        .toEqual([]);
      await page.getByRole("link", { name: "Use findings in Goals" }).click();
      await expect(page.getByRole("heading", { name: "Evaluation-informed suggestions" })).toBeVisible();
      await expect(page.locator('select[name="skill_ids"] option:checked')).not.toHaveCount(0);
    } finally {
      await learner.cleanup();
    }
  });
});
