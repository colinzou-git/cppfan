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

test.describe("real interactive Terminal and Judge0 contract (#667)", () => {
  test.describe.configure({ timeout: 180_000 });

  test.skip(
    process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL !== "true",
    "Requires the dedicated real Terminal workflow."
  );

  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase");

  test("streams multiple inputs, an empty line, EOF, and saves one final attempt", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      await assertRealHealth(page);
      const itemId = "cpp.program_basics.io.lesson";
      await page.goto(`/lab/${encodeURIComponent(itemId)}`);
      await setEditor(
        page,
        `#include <iostream>
#include <string>
int main() {
  std::string first, second, rest;
  std::cout << "first>" << std::flush;
  std::getline(std::cin, first);
  std::cout << "one:" << first << "\\nsecond>" << std::flush;
  std::getline(std::cin, second);
  std::cout << "two:" << second << "\\n";
  while (std::getline(std::cin, rest)) {}
  std::cout << "eof\\n";
}`
      );
      await page.getByTestId("code-lab-tab-stdin").click();
      await page.getByTestId("code-stdin").fill("");
      await controls(page).getByRole("button", { name: "Run", exact: true }).click();
      const transcript = page.getByTestId("code-terminal-transcript");
      await expect(transcript).toContainText("first>", { timeout: 30_000 });

      const input = page.getByTestId("code-terminal-input");
      await input.fill("hello with spaces");
      await page.getByTestId("code-terminal-send").click();
      await expect(transcript).toContainText("one:hello with spaces");
      await expect(transcript).toContainText("second>");
      await input.fill("");
      await page.getByTestId("code-terminal-send").click();
      await expect(transcript).toContainText("two:");
      await page.getByTestId("code-terminal-eof").click();
      await expect(page.getByTestId("code-terminal-status")).toHaveText("Exited", {
        timeout: 30_000
      });
      await expect(transcript).toContainText("eof");

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

  test("stops a real process and retains the transcript", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      await assertRealHealth(page);
      await page.goto("/lab/cpp.program_basics.io.lesson");
      await setEditor(
        page,
        `#include <chrono>
#include <iostream>
#include <thread>
int main(){ std::cout << "waiting" << std::flush; for(;;) std::this_thread::sleep_for(std::chrono::milliseconds(100)); }`
      );
      await controls(page).getByRole("button", { name: "Run", exact: true }).click();
      await expect(page.getByTestId("code-terminal-transcript")).toContainText("waiting");
      await controls(page).getByRole("button", { name: "Stop" }).click();
      await expect(page.getByTestId("code-terminal-status")).toHaveText("Stopped");
      await expect(page.getByTestId("code-terminal-transcript")).toContainText("stopped by you");
      await expect(controls(page).getByRole("button", { name: "Run", exact: true })).toBeEnabled();
    } finally {
      await learner.cleanup();
    }
  });

  test("runs function-only source in Terminal and through real Judge0 tests", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const seeded = await learner.seedPublishedExercise({
        title: "PW real function parity",
        mode: "function",
        functionSignature: "int add(int a, int b)",
        tests: [
          {
            name: "sample",
            input: "2 3",
            expectedOutput: "5",
            hidden: false
          },
          {
            name: "hidden",
            input: "10 20",
            expectedOutput: "30",
            hidden: true
          }
        ]
      });
      const page = await context.newPage();
      await assertRealHealth(page);
      await page.goto(`/lab/${encodeURIComponent(seeded.itemId)}`);
      await expect(page.getByRole("tab", { name: "Arguments" })).toBeVisible();
      await page.getByRole("tab", { name: "Arguments" }).click();
      await page.getByTestId("code-stdin").fill("2 3\n");
      await setEditor(page, "int add(int a, int b){ return a + b; }");

      await controls(page).getByRole("button", { name: "Run", exact: true }).click();
      await expect(page.getByTestId("code-terminal-status")).toHaveText("Exited", {
        timeout: 30_000
      });
      await expect(page.getByTestId("code-terminal-transcript")).toContainText("5");

      await controls(page).getByRole("button", { name: "Run Tests" }).click();
      await expect(page.getByTestId("code-test-summary")).toHaveText("2/2 tests passed", {
        timeout: 30_000
      });
      await expect(page.getByTestId("code-test-results")).toContainText("Judge0 real compile/run");
    } finally {
      await learner.cleanup();
    }
  });

  test("materializes fixtures consistently for Terminal and Judge0", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const source = `#include <fstream>
#include <iostream>
#include <string>
int main(){ std::ifstream f("fixtures/message.txt"); std::string s; std::getline(f,s); std::cout << s; }`;
      const seeded = await learner.seedPublishedLab({
        title: "PW real fixture parity",
        starterCode: source,
        fixtures: [{ filename: "fixtures/message.txt", content: "fixture-ok" }],
        tests: [
          {
            name: "fixture",
            input: "",
            expectedOutput: "fixture-ok",
            hidden: false
          }
        ]
      });
      const page = await context.newPage();
      await assertRealHealth(page);
      await page.goto(`/lab/${encodeURIComponent(seeded.itemId)}`);
      await setEditor(page, source);

      await controls(page).getByRole("button", { name: "Run", exact: true }).click();
      await expect(page.getByTestId("code-terminal-status")).toHaveText("Exited", {
        timeout: 30_000
      });
      await expect(page.getByTestId("code-terminal-transcript")).toContainText("fixture-ok");

      await controls(page).getByRole("button", { name: "Run Tests" }).click();
      await expect(page.getByTestId("code-test-summary")).toHaveText("1/1 tests passed", {
        timeout: 30_000
      });
      await expect(page.getByTestId("code-test-results")).toContainText("Judge0 real compile/run");
    } finally {
      await learner.cleanup();
    }
  });

  test("persists milestone evidence, reports regression, and completes the current lab version", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const seeded = await learner.seedPublishedLab({
        title: "PW authoritative cumulative lab",
        starterCode: "",
        milestones: [
          {
            id: "first-value",
            title: "First value",
            instructions: "Print one for input 1.",
            required: true,
            tests: [
              {
                name: "prints one",
                input: "1\n",
                expectedOutput: "one\n",
                hidden: false
              }
            ]
          },
          {
            id: "second-value",
            title: "Second value",
            instructions: "Print two for input 2.",
            required: true,
            tests: [
              {
                name: "prints two",
                input: "2\n",
                expectedOutput: "two\n",
                hidden: false
              }
            ]
          }
        ]
      });
      const page = await context.newPage();
      await assertRealHealth(page);
      await page.goto(`/lab/${encodeURIComponent(seeded.itemId)}`);
      const milestoneTabs = page.getByTestId("lab-milestone-tab");
      await expect(milestoneTabs).toHaveCount(2);

      await setEditor(
        page,
        '#include <iostream>\nint main(){ int x; std::cin >> x; std::cout << (x == 1 ? "one\\n" : "wrong\\n"); }'
      );
      await controls(page).getByRole("button", { name: "Run Tests" }).click();
      await expect(page.getByTestId("code-test-summary")).toHaveText("1/1 tests passed", {
        timeout: 30_000
      });
      await expect(milestoneTabs.nth(0).getByLabel("Milestone progress saved")).toBeVisible();
      await expect
        .poll(async () => (await learner.labMilestoneProgress(seeded.itemId)).length)
        .toBe(1);
      expect((await learner.labMilestoneProgress(seeded.itemId))[0]).toMatchObject({
        milestone_id: "first-value",
        content_version_id: seeded.publishedVersionId,
        status: "passed"
      });
      expect((await learner.labMilestoneProgress(seeded.itemId))[0]?.code_snapshot_hash).toMatch(
        /^[0-9a-f]{64}$/
      );

      await page.reload();
      await expect(
        page.getByTestId("lab-milestone-tab").nth(0).getByLabel("Milestone progress saved")
      ).toBeVisible();
      await page.getByTestId("lab-milestone-tab").nth(1).click();
      await setEditor(
        page,
        '#include <iostream>\nint main(){ int x; std::cin >> x; std::cout << (x == 2 ? "two\\n" : "wrong\\n"); }'
      );
      await controls(page).getByRole("button", { name: "Run Tests" }).click();
      await expect(page.getByTestId("code-test-summary")).toHaveText("1/1 tests passed", {
        timeout: 30_000
      });
      await expect(
        page.getByTestId("lab-milestone-tab").nth(1).getByLabel("Milestone progress saved")
      ).toBeVisible();
      await expect
        .poll(async () => (await learner.labMilestoneProgress(seeded.itemId)).length)
        .toBe(2);

      await page
        .getByTestId("lab-completion-controls")
        .getByRole("button", { name: "Validate & complete" })
        .click();
      await expect(page.getByTestId("lab-regressed")).toContainText("First value", {
        timeout: 30_000
      });
      expect(await learner.labCompletion(seeded.itemId)).toBeNull();

      await setEditor(
        page,
        '#include <iostream>\nint main(){ int x; std::cin >> x; if (x == 1) std::cout << "one\\n"; else if (x == 2) std::cout << "two\\n"; }'
      );
      await controls(page).getByRole("button", { name: "Run Tests" }).click();
      await expect(page.getByTestId("code-test-summary")).toHaveText("1/1 tests passed", {
        timeout: 30_000
      });
      await page
        .getByTestId("lab-completion-controls")
        .getByRole("button", { name: "Validate & complete" })
        .click();
      await expect(page.getByTestId("lab-complete-banner")).toBeVisible({ timeout: 30_000 });
      await expect
        .poll(async () => (await learner.labCompletion(seeded.itemId))?.status)
        .toBe("completed");
      expect(await learner.labCompletion(seeded.itemId)).toMatchObject({
        project_id: seeded.itemId,
        content_version_id: seeded.publishedVersionId,
        status: "completed"
      });
    } finally {
      await learner.cleanup();
    }
  });
});
