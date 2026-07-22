import { expect, test } from "@playwright/test";

// #411: the boundary-case checklist beside a Code Lab task. The structure.lesson
// item maps to the io_basics checklist (via skill tags) and supplements the
// binary_search checklist (via boundaryChecklistIds). Runs signed-out, no AI.

const CODE_ITEM = "/learn/cpp.program_basics.structure.lesson";

test("a Code Lab task shows a boundary-case checklist the learner can use", async ({ page }) => {
  await page.goto(CODE_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  const checklist = page.getByTestId("boundary-checklist");
  await expect(checklist).toBeVisible();

  // Expand and confirm it is framed as strategy hints, not grading.
  await page.getByTestId("boundary-checklist-toggle").click();
  await expect(checklist).toContainText(/not grading criteria/i);
  await expect(checklist).toContainText(/binary search|lo\/hi/i);

  // Check an item off; the count updates.
  const items = page.getByTestId("boundary-checklist-item");
  await items.first().check();
  await expect(items.first()).toBeChecked();

  // "Use as stdin" drops the sample into the Input Args field and Run (which now
  // starts the interactive Terminal, #664) still works.
  await page.getByTestId("boundary-checklist-use-input").first().click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-terminal")).toBeVisible();
});
