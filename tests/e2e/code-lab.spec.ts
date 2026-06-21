import { expect, test } from "@playwright/test";

// #407: the in-app C++ Code Lab on a real learning-item page. Runs signed-out
// with the default deterministic mock runner (CODE_RUNNER_PROVIDER unset) and no
// AI provider, so Run/Test produce simulated output and AI Review shows its
// graceful unavailable state.

const CODE_ITEM = "/learn/cpp.program_basics.structure.lesson";
const PLAIN_ITEM = "/learn/cpp.program_basics.structure.mc_entry";

test("a code-capable item runs, tests, and reviews in-page", async ({ page }) => {
  await page.goto(CODE_ITEM);

  const lab = page.getByTestId("code-lab");
  await expect(lab).toBeVisible();
  await expect(page.getByTestId("code-editor")).toBeVisible();
  // The starter program is shown in the editor.
  await expect(lab).toContainText("Hello, cppFan!");

  // Run: simulated stdout appears.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const output = page.getByTestId("code-output");
  await expect(output).toBeVisible();
  await expect(output).toContainText("Hello, cppFan!");

  // Run Tests: every test passes for the correct starter solution.
  await page.getByRole("button", { name: "Run Tests" }).click();
  const tests = page.getByTestId("code-test-results");
  await expect(tests).toBeVisible();
  await expect(page.getByTestId("code-test-summary")).toContainText("tests passed");
  await expect(page.locator('[data-testid="code-test-case"][data-passed="true"]').first()).toBeVisible();

  // AI Review: with no provider configured, the graceful unavailable state shows
  // and Run/Test remain usable.
  await page.getByRole("button", { name: "AI Review Code" }).click();
  await expect(page.getByTestId("code-ai-review")).toContainText(/not available|review/i);
});

test("editing the code changes the run output", async ({ page }) => {
  await page.goto(CODE_ITEM);
  await expect(page.getByTestId("code-editor")).toBeVisible();

  // Drive the edit through Monaco's own API (setValue fires the same change
  // handler a keystroke would). Monaco keyboard automation drops/reorders
  // characters across chromium/webkit, so this is the deterministic path.
  await page.waitForFunction(() => Boolean((window as Window & { __cppfanCodeLabEditor?: unknown }).__cppfanCodeLabEditor));
  await page.evaluate((source) => {
    (window as Window & { __cppfanCodeLabEditor?: { setValue(value: string): void } }).__cppfanCodeLabEditor!.setValue(
      source
    );
  }, '#include <iostream>\nint main() { std::cout << "Edited output" << "\\n"; }');

  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-output")).toContainText("Edited output");
});

test("a non-code item does not show the Code Lab", async ({ page }) => {
  await page.goto(PLAIN_ITEM);
  await expect(page.getByTestId("learning-item")).toBeVisible();
  await expect(page.getByTestId("code-lab")).toHaveCount(0);
});
