import { expect, test } from "@playwright/test";

// #180: the evidence log lets the learner self-report an interview practice
// outcome that feeds the readiness report. Signed-out, saving prompts a sign-in
// (no crash); the form itself works locally.

test("the interview catalog links to the evidence log", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("evidence-log-link").click();
  await expect(page).toHaveURL(/\/interview\/log$/);
  await expect(page.getByTestId("evidence-log")).toBeVisible();
});

test("logging an outcome signed-out prompts a sign-in", async ({ page }) => {
  await page.goto("/interview/log");

  await expect(page.getByTestId("evidence-problem")).toBeVisible();
  await page.getByTestId("evidence-context").selectOption("mock");
  await page.getByTestId("evidence-correct").check();
  await page.getByTestId("evidence-save").click();

  await expect(page.getByTestId("evidence-notice")).toContainText(/sign in/i);
});
