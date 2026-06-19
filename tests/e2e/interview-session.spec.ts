import { expect, test } from "@playwright/test";

// #177: the timed interview session runner. Signed-out it works locally (saving is
// a no-op) so the phase progression is exercised end to end without a database.

test("a practice session advances through phases and completes", async ({ page }) => {
  await page.goto("/interview/session");

  const runner = page.getByTestId("session-runner");
  await expect(runner).toBeVisible();
  await expect(page.getByTestId("session-status")).toContainText(/clarify the problem/i);

  await page.getByTestId("session-next").click();
  await expect(page.getByTestId("session-status")).toContainText(/work examples/i);

  await page.getByTestId("session-prev").click();
  await expect(page.getByTestId("session-status")).toContainText(/clarify the problem/i);

  await page.getByTestId("session-complete").click();
  await expect(runner).toHaveAttribute("data-status", "completed");
  await expect(page.getByTestId("session-restart")).toBeVisible();
});

test("the interview catalog links to a timed session", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("session-link").click();
  await expect(page).toHaveURL(/\/interview\/session$/);
  await expect(page.getByTestId("session-runner")).toBeVisible();
});

test("the live timer counts down while the session is in progress", async ({ page }) => {
  await page.goto("/interview/session");

  const value = page.getByTestId("session-timer-value");
  await expect(value).toBeVisible();
  await expect(value).toHaveText(/^\d+:\d{2}$/); // mm:ss remaining
  const initial = await value.textContent();

  // It ticks down once per second; within a couple seconds it should differ.
  await expect.poll(async () => value.textContent(), { timeout: 4000 }).not.toBe(initial);

  // Completing the session stops the countdown.
  await page.getByTestId("session-complete").click();
  await expect(page.getByTestId("session-runner")).toHaveAttribute("data-status", "completed");
});

test("interview mode exposes duration controls and evidence capture", async ({ page }) => {
  await page.goto("/interview/session");

  await page.getByTestId("session-mode-interview").click();
  await page.getByTestId("session-duration-35").click();

  await expect(page.getByTestId("session-meta")).toContainText("interview");
  await expect(page.getByTestId("session-meta")).toContainText("35 min");
  await expect(page.getByTestId("session-prev")).toHaveCount(0);
  await expect(page.getByTestId("session-reveal")).toHaveCount(0);

  await page.getByTestId("session-phase-note").fill("Clarify duplicate IDs and ordering.");
  await page.getByTestId("session-code-draft").fill("int main() { return 0; }");
  await page.getByTestId("session-test-notes").fill("sample, empty, and duplicate-heavy cases");
  await page.getByTestId("session-assistance-used").check();

  await page.getByTestId("session-abandon").click();
  await expect(page.getByTestId("session-runner")).toHaveAttribute("data-status", "abandoned");
  await expect(page.getByTestId("session-status")).toContainText(/abandoned/i);
});
