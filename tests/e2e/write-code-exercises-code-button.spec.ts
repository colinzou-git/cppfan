import { expect, test } from "@playwright/test";

// #440: /exercises makes the built-in Code Lab the primary workflow. Each card
// has a Code button to /lab/<exerciseId>, instructions are in-app-first, and AI
// Chat stays scoped to the write-code exercise. Runs signed-out, no AI.

test("page text is updated to the built-in editor workflow", async ({ page }) => {
  await page.goto("/exercises");

  await expect(page.getByRole("heading", { name: "Write-code exercises" }).first()).toBeVisible();
  await expect(page.getByText("cppFan never runs your code")).toHaveCount(0);
  await expect(page.getByText("Codespace or your own editor")).toHaveCount(0);
  await expect(page.getByText("built-in editor").first()).toBeVisible();
});

test("every exercise card has a Code button to /lab/<exerciseId>", async ({ page }) => {
  await page.goto("/exercises");

  const cards = page.getByTestId("exercise-card");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const code = card.getByTestId("exercise-code");
    await expect(code).toBeVisible();
    const href = (await code.getAttribute("href")) ?? "";
    expect(href).toMatch(/^\/lab\//);
  }
});

test("Code button opens the full-screen Code Lab", async ({ page }) => {
  await page.goto("/exercises");

  const card = page.locator('[data-exercise-id="dsa-two-sum-sorted"]');
  await card.getByTestId("exercise-code").click();

  await expect(page).toHaveURL(/\/lab\/dsa-two-sum-sorted$/);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await expect(page.getByText("Back to write-code exercises")).toBeVisible();
});

test("instructions are in-app-first with an advanced local workflow", async ({ page }) => {
  await page.goto("/exercises");

  const card = page.locator('[data-exercise-id="dsa-two-sum-sorted"]');
  await card.getByTestId("exercise-instructions-toggle").click();

  const panel = card.getByTestId("exercise-instructions");
  await expect(panel).toContainText("built-in editor");
  await expect(panel).toContainText("Advanced local workflow");
});

test("AI Chat context stays scoped to the write-code exercise", async ({ page }) => {
  await page.goto("/exercises");

  const card = page.locator('[data-exercise-id="dsa-two-sum-sorted"]');
  const href = (await card.getByRole("link", { name: /ai chat/i }).getAttribute("href")) ?? "";
  const contextParam = new URL(href, "http://localhost").searchParams.get("context") ?? "";
  const context = JSON.parse(contextParam);
  expect(context.sourceKind).toBe("write_code_exercise");
  expect(context.sourceId).toBe("dsa-two-sum-sorted");
  expect(context.sourceKind).not.toBe("project_lab");
});
