import { expect, test } from "@playwright/test";

// #416: the debugging lane. A code-capable debugging item shows the Code Lab and
// its feedback area; a non-code debugging concept item renders normally without a
// Code Lab. Runs signed-out, mock runner, no AI.

const CODE_ITEM = "/learn/cpp.tooling.debugging_method.code_first_diagnostic";
const CONCEPT_ITEM = "/learn/cpp.tooling.debugging.lesson";

test("a code-capable debugging item shows the Code Lab and feedback area", async ({ page }) => {
  await page.goto(CODE_ITEM);
  await expect(page.getByTestId("learning-item")).toBeVisible();

  const lab = page.getByTestId("code-lab");
  await expect(lab).toBeVisible();
  await expect(page.getByTestId("code-editor")).toBeVisible();

  // Running shows the output/feedback area, and AI Review is available.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-output")).toBeVisible();
  await expect(page.getByRole("button", { name: "AI Review Code" })).toBeVisible();
});

test("a non-code debugging concept item renders without a Code Lab", async ({ page }) => {
  await page.goto(CONCEPT_ITEM);
  await expect(page.getByTestId("learning-item")).toBeVisible();
  await expect(page.getByTestId("code-lab")).toHaveCount(0);
});
