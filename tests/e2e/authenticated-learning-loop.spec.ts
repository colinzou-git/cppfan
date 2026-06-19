import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

const ITEM_URL = "/learn/cpp.structs_classes.syntax.mc_default_access";

test.describe("authenticated browser learning loop (#96/#99)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("a signed-in learner can answer, review, and rate with the keyboard", async ({ page, context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    test.info().annotations.push({ type: "learner", description: learner.userId });

    try {
      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: /your learning dashboard/i })).toBeVisible();
      await expect(page.getByText(learner.email)).toBeVisible();

      await page.goto(ITEM_URL);
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const wrong = page.getByRole("radio", { name: "Private" });
        await wrong.focus();
        await page.keyboard.press("Space");
        await expect(wrong).toBeChecked();
        await page.getByTestId("answer-submit").press("Enter");
        const wrongResult = page.getByTestId("answer-result");
        await expect(wrongResult).toBeVisible();
        await expect(wrongResult).toHaveAttribute("role", "status");
        await expect(wrongResult).toContainText(/not quite/i);
        await page.getByTestId("answer-retry").press("Enter");
      }

      const correct = page.getByRole("radio", { name: "Public" });
      await correct.focus();
      await page.keyboard.press("Space");
      await expect(correct).toBeChecked();
      await page.getByTestId("answer-submit").press("Enter");

      const answerResult = page.getByTestId("answer-result");
      await expect(answerResult).toBeVisible();
      await expect(answerResult).toHaveAttribute("role", "status");
      await expect(answerResult).toContainText(/correct/i);
      await expect(answerResult).not.toContainText(/not recorded/i);

      await page.goto("/review");
      await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();
      await expect(page.getByTestId("review-queue")).toBeVisible();
      await expect(page.getByTestId("review-ratings")).toHaveCount(0);

      const reveal = page.getByTestId("review-reveal");
      await reveal.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("review-explanation")).toBeVisible();
      await expect(page.getByTestId("review-explanation")).toHaveAttribute("role", "status");
      await expect(page.getByTestId("review-ratings")).toBeVisible();

      const good = page.getByTestId("review-rate-good");
      await good.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("review-empty")).toBeVisible();
      await expect(page.getByTestId("review-empty")).toHaveAttribute("role", "status");

      await page.goto("/dashboard");
      const masterySkill = page.getByTestId("mastery-skill").filter({ hasText: "Struct/class syntax" });
      await expect(masterySkill).toContainText("Weak");
      await expect(page.getByTestId("daily-review")).toContainText(/FSRS/i);
      await expect(page.getByTestId("daily-new-for-goals")).toContainText(/FSRS reviews never appear here/i);
    } finally {
      await learner.cleanup();
    }
  });
});
