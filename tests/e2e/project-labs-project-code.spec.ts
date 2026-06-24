import { expect, test } from "@playwright/test";

// #439: /labs uses one unified project card per project with exactly four
// project-level actions, all old milestone-level UI removed, and Code opens the
// single project codebase at /lab/<projectId>. Runs signed-out, no AI.

test("/labs removes old milestone-level UI", async ({ page }) => {
  await page.goto("/labs");

  await expect(page.getByRole("heading", { name: /project labs/i })).toBeVisible();
  await expect(page.getByText("AI help for capstone milestones")).toHaveCount(0);
  await expect(page.getByText("Mark started")).toHaveCount(0);
  await expect(page.getByText("In-app code lab")).toHaveCount(0);
});

test("every project card has the four project-level actions and a project-level Code link", async ({
  page
}) => {
  await page.goto("/labs");

  const cards = page.getByTestId("project-lab");
  const count = await cards.count();
  expect(count).toBeGreaterThan(1);

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    await expect(card.getByTestId("project-code")).toBeVisible();
    await expect(card.getByRole("link", { name: /ai chat/i })).toBeVisible();
    await expect(card.getByRole("link", { name: /chat history/i })).toBeVisible();
    await expect(card.getByTestId("project-mark-complete")).toBeVisible();

    // `Button asChild` merges data-testid onto the <a>, so the testid element is
    // the link itself (no nested anchor).
    const href = (await card.getByTestId("project-code").getAttribute("href")) ?? "";
    expect(href).toMatch(/\/lab\//);
    expect(href).not.toMatch(/\.m\d+/);
  }
});

test("CSV table summarizer Code opens the project-level Code Lab", async ({ page }) => {
  await page.goto("/labs");

  const card = page.locator('[data-project-id="csv-table-summarizer"]').first();
  await card.getByTestId("project-code").click();

  await expect(page).toHaveURL(/\/lab\/csv-table-summarizer$/);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await expect(page.getByText("Back to project labs")).toBeVisible();
});

test("AI Chat context for a project is project-level", async ({ page }) => {
  await page.goto("/labs");

  const card = page.locator('[data-project-id="csv-table-summarizer"]').first();
  const href = (await card.getByRole("link", { name: /ai chat/i }).getAttribute("href")) ?? "";
  expect(href).toContain("/tutor");

  const contextParam = new URL(href, "http://localhost").searchParams.get("context") ?? "";
  const context = JSON.parse(contextParam);
  expect(context.sourceKind).toBe("project_lab");
  expect(context.sourceId).toBe("csv-table-summarizer");
  expect(context.sourceKind).not.toBe("capstone_milestone");
});

test("signed-out Mark complete prompts to sign in", async ({ page }) => {
  await page.goto("/labs");

  const card = page.locator('[data-project-id="csv-table-summarizer"]').first();
  await card.getByTestId("project-mark-complete").click();
  await expect(card.getByTestId("project-notice")).toContainText(/sign in to save project progress/i);
});
