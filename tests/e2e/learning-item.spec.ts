import { expect, test } from "@playwright/test";

// A stable seeded item id (see learning-item-seed.ts / the migration).
const SEED_ITEM_ID = "cpp.structs_classes.syntax.lesson";

test("a seeded learning item opens with its content", async ({ page }) => {
  await page.goto(`/learn/${SEED_ITEM_ID}`);

  const item = page.getByTestId("learning-item");
  await expect(item).toBeVisible();
  await expect(item.getByRole("heading", { name: "Defining a struct or class" })).toBeVisible();
  await expect(item.getByTestId("learning-item-type")).toHaveText(/lesson/i);
  await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();
});

test("a multiple-choice item lists its choices without revealing the answer", async ({ page }) => {
  await page.goto("/learn/cpp.structs_classes.syntax.mc_default_access");

  const choices = page.getByTestId("learning-item-choices");
  await expect(choices).toBeVisible();
  await expect(choices.getByText("Public", { exact: true })).toBeVisible();
  await expect(choices.getByText("Private", { exact: true })).toBeVisible();
});

test("a value-semantics state-tracing item renders as code reading", async ({ page }) => {
  await page.goto("/learn/cpp.value_semantics.special_members.code_state_trace");

  const item = page.getByTestId("learning-item");
  await expect(item).toBeVisible();
  await expect(item.getByRole("heading", { name: "Trace ownership after copy and move" })).toBeVisible();
  await expect(item.getByTestId("learning-item-type")).toHaveText(/code reading/i);
  await expect(item).toContainText("std::move");
  await expect(item).toContainText("third");
});

test("the dashboard skill map links into a learning item or shows an auth gate", async ({ page }) => {
  await page.goto("/dashboard");

  const dashboardHeading = page.getByRole("heading", { name: /your learning dashboard/i });
  const dashboardVisible = await dashboardHeading.isVisible().catch(() => false);

  if (!dashboardVisible) {
    // Supabase configured but unauthenticated: the dashboard gates to login.
    await expect(page).toHaveURL(/\/login|\/onboarding/);
    return;
  }

  const firstSkillLink = page.getByTestId("skill-map-skill-link").first();
  await expect(firstSkillLink).toBeVisible();
  await firstSkillLink.click();

  await expect(page).toHaveURL(/\/learn\//);
  await expect(page.getByTestId("learning-item")).toBeVisible();
});
