import { expect, test } from "@playwright/test";

// Seeded multiple-choice item; correct answer is "Public".
const MC_ITEM = "/learn/cpp.structs_classes.syntax.mc_default_access";

test("answering a multiple-choice item correctly is graded correct", async ({ page }) => {
  await page.goto(MC_ITEM);

  const form = page.getByTestId("answer-form");
  await expect(form).toBeVisible();

  await form.getByText("Public", { exact: true }).click();
  await page.getByTestId("answer-submit").click();

  const result = page.getByTestId("answer-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText(/correct/i);
  await expect(result).not.toContainText(/not quite/i);
});

test("a wrong answer is graded incorrect and can be retried", async ({ page }) => {
  await page.goto(MC_ITEM);

  await page.getByTestId("answer-form").getByText("Private", { exact: true }).click();
  await page.getByTestId("answer-submit").click();

  const result = page.getByTestId("answer-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText(/not quite/i);

  // Retry resets the form so the learner can answer again.
  await page.getByTestId("answer-retry").click();
  await expect(page.getByTestId("answer-result")).toHaveCount(0);
  await expect(page.getByTestId("answer-submit")).toBeVisible();
});
