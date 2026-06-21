import { expect, test } from "@playwright/test";

// #415: after passing a Code Lab task (no error-pattern remediation), the
// adaptive scaffold selector suggests the next practice format (Code Lab, since
// the learner is ready to write code). It is a suggestion, not a hard lock.
// Runs signed-out, mock runner, no AI.

const CODE_ITEM = "/learn/cpp.program_basics.structure.lesson";

test("passing a Code Lab task surfaces a non-locking scaffold recommendation", async ({ page }) => {
  await page.goto(CODE_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(page.getByTestId("code-test-results")).toBeVisible();

  const card = page.getByTestId("scaffold-recommendation");
  await expect(card).toBeVisible();
  await expect(card).toContainText(/Recommended next practice/i);
  await expect(card).toContainText(/practice anything you like/i);

  await page.getByTestId("scaffold-recommendation-link").click();
  await expect(page).toHaveURL(/#code-lab$/);

  // It does not block anything: Run still works.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-output")).toBeVisible();
});
