import { expect, test } from "@playwright/test";

// #664: the interactive Terminal for live cin/getline input. Runs signed-out with
// the default deterministic mock terminal provider (CODE_TERMINAL_PROVIDER unset,
// non-production), so Run starts a simulated interactive session without a real
// execution service. The mock echoes learner input and simulates a response, so
// the whole multi-input workflow is exercisable offline.

const STDIN_ITEM = "/learn/cpp.program_basics.io.lesson";
const FULL_PAGE_STDIN_ITEM = "/lab/cpp.program_basics.io.lesson";

test("full-page: Terminal + Input Args tabs, live input, empty line, and Stop", async ({ page }) => {
  await page.goto(FULL_PAGE_STDIN_ITEM);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();

  // Tabs are renamed Terminal and Input Args.
  await expect(page.getByTestId("code-lab-tab-terminal")).toHaveText("Terminal");
  await expect(page.getByTestId("code-lab-tab-stdin")).toHaveText("Input Args");

  // Enter multiline Input Args.
  await page.getByTestId("code-lab-tab-stdin").click();
  await page.getByTestId("code-stdin").fill("first line\nsecond line");

  // Run selects the Terminal tab and the session starts.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-lab-tab-terminal")).toHaveAttribute("aria-selected", "true");
  const transcript = page.getByTestId("code-terminal-transcript");
  await expect(transcript).toBeVisible();
  await expect(transcript).toContainText("Program started");
  // Input Args was written to the program.
  await expect(transcript).toContainText("first line");

  // Send a live line: it appears once with the simulated response.
  await page.getByTestId("code-terminal-input").fill("hello world");
  await page.getByTestId("code-terminal-send").click();
  await expect(transcript).toContainText("You entered: hello world");

  // Send an empty line (required for getline scenarios).
  await page.getByTestId("code-terminal-send").click();
  await expect(transcript).toContainText("You entered an empty line.");

  // Stop the session; Run returns.
  await page.getByTestId("code-stop").click();
  await expect(transcript).toContainText("stopped by you");
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeVisible();
});

test("embedded: Run starts the same Terminal session in the right column", async ({ page }) => {
  await page.goto(STDIN_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  await page.getByRole("button", { name: "Run", exact: true }).click();
  const transcript = page.getByTestId("code-terminal-transcript");
  await expect(transcript).toBeVisible();
  await expect(transcript).toContainText("Program started");

  await page.getByTestId("code-terminal-input").fill("42");
  await page.getByTestId("code-terminal-send").click();
  await expect(transcript).toContainText("You entered: 42");

  await page.getByTestId("code-stop").click();
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeVisible();
});

test("Run Tests stays one-shot and does not leak hidden test details", async ({ page }) => {
  await page.goto(STDIN_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  await page.getByRole("button", { name: "Run Tests" }).click();
  const results = page.getByTestId("code-test-results");
  await expect(results).toBeVisible();
  // Run Tests renders its own one-shot results panel (not the interactive
  // transcript), and any hidden cases are shown only as counts — never their
  // concrete inputs/expected outputs.
  await expect(page.getByTestId("code-terminal-input")).toHaveCount(0);
});
