import { expect, test } from "@playwright/test";

// #124/#123: the completion fill-in interaction on a real page. The seeded sum
// item has three blanks: 0, += , sum. Runs signed-out (seed grading), no database.

const ITEM = "/learn/cpp.control_flow.loops.completion_sum";

test("filling the completion blanks correctly is graded correct", async ({ page }) => {
  await page.goto(ITEM);

  const exercise = page.getByTestId("completion-exercise");
  await expect(exercise).toBeVisible();
  await expect(page.getByTestId("completion-blank")).toHaveCount(3);

  await page.locator('[data-testid="completion-blank"][data-position="1"]').fill("0");
  await page.locator('[data-testid="completion-blank"][data-position="2"]').fill("+=");
  await page.locator('[data-testid="completion-blank"][data-position="3"]').fill("sum");
  await page.getByTestId("completion-check").click();

  await expect(page.getByTestId("completion-feedback")).toContainText(/correct/i);
});

test("a wrong blank gives partial structural feedback, not the answer", async ({ page }) => {
  await page.goto(ITEM);

  await page.locator('[data-testid="completion-blank"][data-position="1"]').fill("0");
  await page.locator('[data-testid="completion-blank"][data-position="2"]').fill("-=");
  await page.locator('[data-testid="completion-blank"][data-position="3"]').fill("sum");
  await page.getByTestId("completion-check").click();

  const feedback = page.getByTestId("completion-feedback");
  await expect(feedback).toContainText(/2 of 3 blanks are correct/i);
  // The expected answer text is never revealed in the feedback.
  await expect(feedback).not.toContainText("+=");
});
