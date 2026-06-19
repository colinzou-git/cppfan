import { expect, type Page, test } from "@playwright/test";

// #124: end-to-end coverage of the Parsons interaction on a real page — reorder
// with the explicit (keyboard-friendly, non-drag) move controls, check structure,
// get partial feedback without the solution, then solve and get "correct". Runs
// signed-out (seed grading), so it needs no database.

const ITEM = "/learn/cpp.control_flow.loops.parsons_sum";
const PREFIX = "cpp.control_flow.loops.parsons_sum";
const SOLUTION = [`${PREFIX}.b1`, `${PREFIX}.b2`, `${PREFIX}.b3`, `${PREFIX}.b4`, `${PREFIX}.b5`];
const DISTRACTOR = `${PREFIX}.d1`;

function currentOrder(page: Page) {
  return page.$$eval("[data-testid=parsons-block]", (els) =>
    els.map((el) => el.getAttribute("data-block-id"))
  );
}

test("Parsons: checking gives structural feedback, not the solution", async ({ page }) => {
  await page.goto(ITEM);

  const exercise = page.getByTestId("parsons-exercise");
  await expect(exercise).toBeVisible();
  // 5 solution lines + 1 distractor, shown in a stable non-solution order.
  await expect(page.getByTestId("parsons-block")).toHaveCount(6);

  await page.getByTestId("parsons-check").click();
  // Partial, structural feedback only — never reveals the ordered solution.
  await expect(page.getByTestId("parsons-feedback")).toContainText(/correctly placed/i);

  await page.getByTestId("parsons-hint").click();
  await expect(page.getByTestId("parsons-hint-text")).toContainText(/setup before the loop/i);

  await page.getByTestId("parsons-retry").click();
  await expect(page.getByTestId("parsons-announcement")).toContainText(/reset/i);
});

test("Parsons: arranging the lines correctly (keyboard controls) is graded correct", async ({ page }) => {
  await page.goto(ITEM);
  await expect(page.getByTestId("parsons-exercise")).toBeVisible();

  // Selection sort to [b1..b5, distractor] using only the move-up controls (no
  // drag). Each click moves the targeted line up exactly one position.
  const target = [...SOLUTION, DISTRACTOR];
  for (let i = 0; i < target.length; i++) {
    const order = await currentOrder(page);
    let j = order.indexOf(target[i]);
    while (j > i) {
      await page.locator(`[data-block-id="${target[i]}"] [data-testid=parsons-move-up]`).click();
      j -= 1;
    }
  }
  await expect.poll(() => currentOrder(page)).toEqual(target);

  // Leave the distractor out, then check.
  await page.locator(`[data-block-id="${DISTRACTOR}"] [data-testid=parsons-toggle-include]`).click();
  await page.getByTestId("parsons-check").click();

  await expect(page.getByTestId("parsons-feedback")).toContainText(/right order/i);
});

test("Parsons: pointer drag reorders a line in a real browser", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "HTML drag-and-drop is the desktop pointer path");

  await page.goto(ITEM);
  await expect(page.getByTestId("parsons-exercise")).toBeVisible();

  const before = await currentOrder(page);
  expect(before).toHaveLength(6);

  const source = page.locator(`[data-block-id="${before[0]}"]`);
  const target = page.locator(`[data-block-id="${before[2]}"]`);
  await source.dragTo(target);

  const expected = [before[1], before[0], ...before.slice(2)];
  await expect.poll(() => currentOrder(page)).toEqual(expected);
  await expect(page.getByTestId("parsons-announcement")).toContainText(/dragged line before/i);
});
