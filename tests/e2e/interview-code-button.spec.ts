import { expect, test } from "@playwright/test";

// #444: the Interview problem-card Code button opens the full-page Code Lab
// (/lab/<interviewProblemId>) with the Debug tab — like Labs/Exercises — instead
// of the timed session. The timed session stays reachable via its own button.
// Runs signed-out, no AI.

test("interview Code button opens the full Code Lab workspace", async ({ page }) => {
  await page.goto("/interview");
  const card = page.getByTestId("interview-problem").first();
  await card.getByTestId("interview-problem-code").click();

  await expect(page).toHaveURL(/\/lab\//);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await expect(page.getByText("Back to interview practice")).toBeVisible();
  // The real-debugger Debug tab is available here automatically.
  await expect(page.getByTestId("code-lab-tab-debug")).toBeVisible();
});

test("interview problem still offers a timed session", async ({ page }) => {
  await page.goto("/interview");
  const card = page.getByTestId("interview-problem").first();
  await card.getByTestId("interview-problem-timed-session").click();

  await expect(page).toHaveURL(/\/interview\/session/);
  await expect(page.getByTestId("session-runner")).toBeVisible();
});
