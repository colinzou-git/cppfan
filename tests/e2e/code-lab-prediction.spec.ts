import { expect, test } from "@playwright/test";

// #413/#664: optional prediction-before-run on a real Code Lab item. The
// io.lesson item has predictionMode "optional" (does not block Run). Run now
// starts the interactive Terminal (#664) — the one-shot per-run stdout comparison
// no longer fires on Run, so this asserts the non-blocking contract. Runs
// signed-out, mock providers.

const ECHO_ITEM = "/learn/cpp.program_basics.io.lesson";

test("optional prediction does not block Run, which starts the Terminal", async ({ page }) => {
  await page.goto(ECHO_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  const panel = page.getByTestId("prediction-before-run");
  await expect(panel).toBeVisible();

  // Predict the echoed output. Optional mode means Run is NOT disabled; Run starts
  // the interactive Terminal rather than being blocked by the prediction.
  await page.locator('[data-testid="prediction-input"][data-prompt-id="stdout"]').fill("ping");
  const runButton = page.getByRole("button", { name: "Run", exact: true });
  await expect(runButton).toBeEnabled();
  await runButton.click();
  await expect(page.getByTestId("code-terminal")).toBeVisible();
  await expect(page.getByTestId("code-terminal-transcript")).toContainText("Program started");
});
