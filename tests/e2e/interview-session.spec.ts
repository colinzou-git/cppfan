import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

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

test("practice mode can pause and resume the timer", async ({ page }) => {
  await page.goto("/interview/session");

  const value = page.getByTestId("session-timer-value");
  await page.getByTestId("session-pause").click();
  await expect(page.getByTestId("session-runner")).toHaveAttribute("data-status", "paused");
  await expect(page.getByTestId("session-status")).toContainText(/paused/i);
  await expect(page.getByTestId("session-resume")).toBeVisible();

  const pausedText = (await value.textContent()) ?? "";
  await page.waitForTimeout(1500);
  await expect(value).toHaveText(pausedText);

  await page.getByTestId("session-resume").click();
  await expect(page.getByTestId("session-runner")).toHaveAttribute("data-status", "in_progress");
  await expect.poll(async () => value.textContent(), { timeout: 4000 }).not.toBe(pausedText);
});

test("interview mode exposes duration controls and evidence capture", async ({ page }) => {
  await page.goto("/interview/session");

  await page.getByTestId("session-mode-interview").click();
  await page.getByTestId("session-duration-35").click();

  await expect(page.getByTestId("session-meta")).toContainText("interview");
  await expect(page.getByTestId("session-meta")).toContainText("35 min");
  await expect(page.getByTestId("session-prev")).toHaveCount(0);
  await expect(page.getByTestId("session-pause")).toHaveCount(0);
  await expect(page.getByTestId("session-reveal")).toHaveCount(0);

  await page.getByTestId("session-phase-note").fill("Clarify duplicate IDs and ordering.");
  await page.getByTestId("session-code-draft").fill("int main() { return 0; }");
  await page.getByTestId("session-test-notes").fill("sample, empty, and duplicate-heavy cases");
  await page.getByTestId("session-assistance-used").check();

  await page.getByTestId("session-abandon").click();
  await expect(page.getByTestId("session-runner")).toHaveAttribute("data-status", "abandoned");
  await expect(page.getByTestId("session-status")).toContainText(/abandoned/i);
});

test("a code draft can be queued for judge feedback from the session", async ({ page }) => {
  await page.goto("/interview/session");

  await page.getByTestId("session-code-draft").fill("#include <bits/stdc++.h>\nint main(){ return 0; }\n");
  await page.getByTestId("session-submit-judge").click();
  await expect(page.getByTestId("session-judge-notice")).toContainText(/sign in to queue/i);
});

test.describe("authenticated interview session persistence (#177/#96)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("a signed-in learner resumes their session without leaking it to another learner", async ({
    browser,
    page,
    context,
    baseURL
  }) => {
    const origin = baseURL ?? "http://127.0.0.1:3000";
    const learnerA = await createAuthenticatedLearner(context, origin);
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    const learnerB = await createAuthenticatedLearner(contextB, origin);
    test.info().annotations.push({ type: "learner-a", description: learnerA.userId });
    test.info().annotations.push({ type: "learner-b", description: learnerB.userId });

    try {
      await page.goto("/interview/session");
      await page.getByTestId("session-mode-interview").click();
      await page.getByTestId("session-duration-50").click();
      await page.getByTestId("session-next").click();
      await expect(page.getByTestId("session-status")).toContainText(/work examples/i);

      await page.getByTestId("session-phase-note").fill("A-only persisted example note");
      await page.getByTestId("session-phase-note").blur();
      await page.getByTestId("session-code-draft").fill("int answer = 42;");
      await page.getByTestId("session-code-draft").blur();
      await page.getByTestId("session-test-notes").fill("empty and duplicate-heavy cases");
      await page.getByTestId("session-test-notes").blur();
      await page.getByTestId("session-assistance-used").check();
      await page.waitForTimeout(1000);

      await page.reload();
      await expect(page.getByTestId("session-meta")).toContainText("interview");
      await expect(page.getByTestId("session-meta")).toContainText("50 min");
      await expect(page.getByTestId("session-status")).toContainText(/work examples/i);
      await expect(page.getByTestId("session-phase-note")).toHaveValue("A-only persisted example note");
      await expect(page.getByTestId("session-code-draft")).toHaveValue("int answer = 42;");
      await expect(page.getByTestId("session-test-notes")).toHaveValue("empty and duplicate-heavy cases");
      await expect(page.getByTestId("session-assistance-used")).toBeChecked();

      await pageB.goto(`${origin}/interview/session`);
      await expect(pageB.getByTestId("session-meta")).toContainText("practice");
      await expect(pageB.getByTestId("session-meta")).toContainText("45 min");
      await expect(pageB.getByTestId("session-status")).toContainText(/clarify the problem/i);
      await expect(pageB.getByTestId("session-phase-note")).not.toHaveValue("A-only persisted example note");
      await expect(pageB.getByTestId("session-code-draft")).toHaveValue("");
    } finally {
      await learnerA.cleanup();
      await learnerB.cleanup();
      await contextB.close();
    }
  });
});
