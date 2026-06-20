import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

test.describe("Daily New Learn Extra full loop (#270)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("allocates one Extra action, completes it through trusted grading, and recomputes", async ({ page, context, baseURL }) => {
    test.setTimeout(120_000);
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    try {
      await learner.createStudyGoal({ title: "Program basics", skillId: "cpp.program_basics.structure" });
      await learner.createStudyGoal({ title: "Class syntax", skillId: "cpp.structs_classes.syntax" });
      await learner.createStudyGoal({ title: "Array indexing", skillId: "dsa.arrays.indexing" });
      await page.goto("/dashboard");

      const section = page.getByTestId("daily-new-for-goals");
      await section.getByRole("button", { name: /Learn Extra:/i }).click();
      await expect(section.getByRole("status")).toHaveText("Extra action added.");
      const extra = section.locator('[data-source="learn_extra"]').last();
      await expect(extra.getByText("Extra", { exact: true })).toBeVisible();
      const href = await extra.getByRole("link").getAttribute("href");
      await extra.getByRole("link").click();

      const choices = page.getByRole("radio");
      const count = await choices.count();
      for (let index = 0; index < count; index += 1) {
        await choices.nth(index).check();
        await page.getByTestId("answer-submit").click();
        const result = page.getByTestId("answer-result");
        await expect(result).toBeVisible();
        if (/correct/i.test(await result.textContent() ?? "")) break;
        await page.getByTestId("answer-retry").click();
      }

      await page.goto("/dashboard");
      await expect(page.getByTestId("daily-new-for-goals").locator(`[href="${href}"]`)).toHaveCount(0);
      await expect(page.getByTestId("daily-review")).toContainText(/FSRS/i);
    } finally {
      await learner.cleanup();
    }
  });
});
