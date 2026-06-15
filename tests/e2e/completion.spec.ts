import { expect, test, type Page } from "@playwright/test";

// #124/#123: the completion fill-in interaction on a real page. The seeded sum
// item has three blanks: 0, += , sum. Runs signed-out (seed grading), no database.

const ITEM = "/learn/cpp.control_flow.loops.completion_sum";

// The inputs are controlled. On WebKit, fill() (one synthetic input event) is
// sometimes not captured into React state, so the submitted answer drops a blank.
// Type per-keystroke like a real user (events React reliably captures), then assert
// the value committed — deterministic across chromium/iPhone/iPad/WebKit.
async function fillBlank(page: Page, position: number, value: string) {
  const blank = page.locator(`[data-testid="completion-blank"][data-position="${position}"]`);
  await blank.click();
  await blank.pressSequentially(value);
  await expect(blank).toHaveValue(value);
}

test("filling the completion blanks correctly is graded correct", async ({ page }) => {
  await page.goto(ITEM);

  const exercise = page.getByTestId("completion-exercise");
  await expect(exercise).toBeVisible();
  await expect(page.getByTestId("completion-blank")).toHaveCount(3);

  await fillBlank(page, 1, "0");
  await fillBlank(page, 2, "+=");
  await fillBlank(page, 3, "sum");
  await page.getByTestId("completion-check").click();

  // Assert the full-correct message specifically — a partial result ("1 of 3 …
  // correct") must not pass. This guards against a dropped/raced blank value.
  await expect(page.getByTestId("completion-feedback")).toContainText(/every blank is filled in correctly/i);
});

test("a wrong blank gives partial structural feedback, not the answer", async ({ page }) => {
  await page.goto(ITEM);

  await fillBlank(page, 1, "0");
  await fillBlank(page, 2, "-=");
  await fillBlank(page, 3, "sum");
  await page.getByTestId("completion-check").click();

  const feedback = page.getByTestId("completion-feedback");
  await expect(feedback).toContainText(/2 of 3 blanks are correct/i);
  // The expected answer text is never revealed in the feedback.
  await expect(feedback).not.toContainText("+=");
});
