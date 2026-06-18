import { expect, test } from "@playwright/test";

// #99: keyboard-only operability of the graded interactions. Everything here is
// driven by focus + Space/Enter/typing (no mouse clicks), proving a keyboard-only
// learner can complete a quiz, a completion item, and operate the Parsons controls.
// Signed-out (seed grading), no database.

const MC_ITEM = "/learn/cpp.structs_classes.syntax.mc_default_access";
const COMPLETION_ITEM = "/learn/cpp.control_flow.loops.completion_sum";
const PARSONS_ITEM = "/learn/cpp.control_flow.loops.parsons_sum";

test("a learner can select, submit, and retry a quiz with the keyboard only", async ({ page }) => {
  await page.goto(MC_ITEM);

  // Select the correct choice with the keyboard, then submit with Enter.
  const correct = page.getByRole("radio", { name: "Public" });
  await correct.focus();
  await page.keyboard.press("Space");
  await expect(correct).toBeChecked();

  await page.getByTestId("answer-submit").press("Enter");

  const result = page.getByTestId("answer-result");
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("role", "status");
  await expect(result).toContainText(/correct/i);

  // Retry with the keyboard resets the form.
  await page.getByTestId("answer-retry").press("Enter");
  await expect(page.getByTestId("answer-result")).toHaveCount(0);
  await expect(page.getByTestId("answer-submit")).toBeVisible();
});

test("a learner can fill and check a completion item with the keyboard only", async ({ page }) => {
  await page.goto(COMPLETION_ITEM);
  await expect(page.getByTestId("completion-exercise")).toBeVisible();

  for (const [position, value] of [
    [1, "0"],
    [2, "+="],
    [3, "sum"]
  ] as const) {
    const input = page.locator(`[data-testid="completion-blank"][data-position="${position}"]`);
    await input.focus();
    await page.keyboard.type(value);
  }
  await page.getByTestId("completion-check").press("Enter");
  await expect(page.getByTestId("completion-feedback")).toContainText(/correct/i);
  await expect(page.getByTestId("completion-feedback")).toHaveAttribute("role", "status");
});

test("the Parsons move and check controls are operable by keyboard", async ({ page }) => {
  await page.goto(PARSONS_ITEM);
  await expect(page.getByTestId("parsons-exercise")).toBeVisible();

  // The move-up control activates on Enter (a button, not drag-only).
  const order = () => page.$$eval("[data-testid=parsons-block]", (els) => els.map((e) => e.getAttribute("data-block-id")));
  const before = await order();
  await page.locator(`[data-block-id="${before[1]}"] [data-testid=parsons-move-up]`).press("Enter");
  await expect.poll(order).not.toEqual(before);

  await page.getByTestId("parsons-check").press("Enter");
  await expect(page.getByTestId("parsons-feedback")).not.toBeEmpty();
  await expect(page.getByTestId("parsons-feedback")).toHaveAttribute("role", "status");
});

test("skill-map and lab navigation are reachable by keyboard", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  if (await dashboardHeading.isVisible().catch(() => false)) {
    const firstSkill = page.getByTestId("skill-map-skill-link").first();
    await firstSkill.focus();
    await expect(firstSkill).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\//);
    await expect(page.getByTestId("learning-item")).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/login|\/onboarding/);
  }

  await page.goto("/labs");
  const firstTrack = page.getByTestId("capstone-track-link").first();
  await firstTrack.focus();
  await expect(firstTrack).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/labs\/tracks\//);
  await expect(page.getByTestId("capstone-tracks")).toBeVisible();
});
