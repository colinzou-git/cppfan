import { expect, test } from "@playwright/test";

// #413/#664: optional prediction-before-run on a real Code Lab item. The
// io.lesson item has predictionMode "optional" (does not block Run). Run now
// starts the interactive Terminal; the one-shot Run Tests path drives the
// prediction comparison. Runs signed-out, mock providers.

const ECHO_ITEM = "/learn/cpp.program_basics.io.lesson";

test("optional prediction does not block Run and is compared after Run Tests", async ({ page }) => {
  await page.goto(ECHO_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  const panel = page.getByTestId("prediction-before-run");
  await expect(panel).toBeVisible();

  // Predict the echoed output. Optional mode means Run is NOT disabled; Run starts
  // the interactive Terminal.
  await page.locator('[data-testid="prediction-input"][data-prompt-id="stdout"]').fill("ping");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-terminal")).toBeVisible();
  await page.getByTestId("code-stop").click();

  // Run Tests compares the prediction against the executed result.
  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(page.getByTestId("prediction-comparison").first()).toBeVisible();
});
