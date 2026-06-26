import { expect, test } from "@playwright/test";

// #440/#447: /exercises makes the built-in Code Lab the primary workflow through a
// grouped accordion. The first group is expanded with its first exercise selected;
// the shared detail panel's primary Study button opens the full-screen Code Lab at
// /lab/<exerciseId>. Signed-out, no AI.

test("the detail panel Study button targets a lab exercise", async ({ page }) => {
  await page.goto("/exercises");

  // Study is a button (#472): it records the start date and navigates via the
  // router. Its target exercise is exposed as data-exercise-id.
  const study = page.getByTestId("exercise-study");
  await expect(study).toBeVisible();
  expect((await study.getAttribute("data-exercise-id")) ?? "").not.toBe("");
});

test("selecting a different child exercise retargets the Study button", async ({ page }) => {
  await page.goto("/exercises");

  const radios = page.getByTestId("exercise-child-radio");
  const before = (await page.getByTestId("exercise-study").getAttribute("data-exercise-id")) ?? "";
  if ((await radios.count()) > 1) {
    await radios.nth(1).check();
    const after = (await page.getByTestId("exercise-study").getAttribute("data-exercise-id")) ?? "";
    expect(after).not.toBe("");
    expect(after).not.toBe(before);
  }
});

test("Study opens the full-screen Code Lab", async ({ page }) => {
  await page.goto("/exercises");

  await page.getByTestId("exercise-study").click();
  await expect(page).toHaveURL(/\/lab\/.+/);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await expect(page.getByText("Back to write-code exercises")).toBeVisible();
});
