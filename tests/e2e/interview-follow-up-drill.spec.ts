import { expect, test } from "@playwright/test";

// #181: the timed session surfaces a deterministic adaptation drill. Until the
// base solution is marked correct it offers a diagnostic/hint; once correct (with
// time left) it delivers a reviewed follow-up. Reasoning self-assessment grades
// the adaptation with partial credit when time expires. Signed-out, no database.

test("the session offers a diagnostic until the base is correct, then a follow-up", async ({ page }) => {
  await page.goto("/interview/session");

  const drill = page.getByTestId("follow-up-drill");
  await expect(drill).toBeVisible();

  // Base not correct yet -> diagnostic/hint, no follow-up prompt.
  await expect(page.getByTestId("drill-delivery")).toHaveAttribute("data-mode", "diagnostic_hint");

  // Mark the base correct -> a reviewed follow-up is delivered.
  await page.getByTestId("drill-base-correct").check();
  await expect(page.getByTestId("drill-delivery")).toHaveAttribute("data-mode", "follow_up");
  await expect(page.getByTestId("drill-prompt")).toBeVisible();
});

test("reasoning self-assessment yields partial credit when time expires", async ({ page }) => {
  await page.goto("/interview/session");

  await page.getByTestId("drill-reasoning").check();
  await page.getByTestId("drill-expired").check();
  await expect(page.getByTestId("drill-outcome")).toHaveAttribute("data-credit", "partial");

  // Finishing the implementation (and not expired) earns full credit.
  await page.getByTestId("drill-expired").uncheck();
  await page.getByTestId("drill-impl").check();
  await expect(page.getByTestId("drill-outcome")).toHaveAttribute("data-credit", "full");
});
