import { expect, test, type Page } from "@playwright/test";
import {
  createAuthenticatedLearner,
  hasAuthenticatedE2EEnv
} from "./helpers/authenticated-learner";

type EditorWindow = Window & {
  __cppfanCodeLabEditor?: { setValue(value: string): void };
};

async function assertRealHealth(page: Page) {
  const response = await page.request.get("/api/code/terminal/health");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).result).toMatchObject({
    status: "ok",
    provider: "execution-service"
  });
}

async function setEditor(page: Page, source: string) {
  await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
  await page.evaluate(
    (value) => (window as EditorWindow).__cppfanCodeLabEditor!.setValue(value),
    source
  );
}

function controls(page: Page) {
  return page.locator('[data-testid="code-controls"]').first();
}

test.describe("native interview interactive Terminal regression (#698)", () => {
  test.describe.configure({ timeout: 180_000 });

  test.skip(
    process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL !== "true",
    "Requires the dedicated real Terminal workflow."
  );

  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase");

  test("waits for learner live input instead of auto-feeding Example 1", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      await assertRealHealth(page);

      const itemId = "iv.prefix.balance-returns-to-zero";
      await page.goto(`/lab/${encodeURIComponent(itemId)}`);

      // Native interview examples remain available to Run Tests, but interactive
      // Run must not silently copy Example 1 into pre-run Input Args (#698).
      await page.getByTestId("code-lab-tab-stdin").click();
      await expect(page.getByTestId("code-stdin")).toHaveValue("");

      await setEditor(
        page,
        `#include <iostream>
#include <string>
int main() {
  std::string line;
  std::cout << "value>" << std::flush;
  std::getline(std::cin, line);
  std::cout << "got:" << line << "\\n";
}`
      );

      await controls(page).getByRole("button", { name: "Run", exact: true }).click();
      const transcript = page.getByTestId("code-terminal-transcript");
      const status = page.getByTestId("code-terminal-status");
      await expect(transcript).toContainText("value>", { timeout: 30_000 });
      await expect(status).toHaveText("Running");

      const input = page.getByTestId("code-terminal-input");
      await expect(input).toBeVisible();
      // One extra poll interval proves the child remains blocked on its own read
      // rather than exiting after an implicit visible-example stdin payload.
      await page.waitForTimeout(750);
      await expect(status).toHaveText("Running");
      await expect(input).toBeVisible();

      await input.fill("learner-value");
      await page.getByTestId("code-terminal-send").click();
      await expect(transcript).toContainText("got:learner-value");
      await expect(status).toHaveText("Exited", { timeout: 30_000 });
      await expect(transcript).not.toContainText("[1, -1, 2, -2]");

      await expect.poll(async () => (await learner.terminalAttempts(itemId)).length).toBe(1);
      expect((await learner.terminalAttempts(itemId))[0]).toMatchObject({
        run_status: "terminal_exited",
        tests_passed: null,
        tests_total: null
      });
    } finally {
      await learner.cleanup();
    }
  });
});
