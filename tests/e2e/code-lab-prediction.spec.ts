import { expect, test } from "@playwright/test";

// #413: optional prediction-before-run on a real Code Lab item. The io.lesson
// item has predictionMode "optional" (does not block Run) and echoes stdin, so a
// "ping" prediction matches the run output. Runs signed-out, mock runner.

const ECHO_ITEM = "/learn/cpp.program_basics.io.lesson";

test("optional prediction does not block Run and is compared after running", async ({ page }) => {
  await page.goto(ECHO_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  const panel = page.getByTestId("prediction-before-run");
  await expect(panel).toBeVisible();

  // Predict the echoed output. Optional mode means Run is NOT disabled.
  await page.locator('[data-testid="prediction-input"][data-prompt-id="stdout"]').fill("ping");
  await page.getByRole("button", { name: "Run", exact: true }).click();

  await expect(page.getByTestId("code-output")).toContainText("ping");
  const comparison = page.getByTestId("prediction-comparison").first();
  await expect(comparison).toHaveAttribute("data-status", "matched");
});
