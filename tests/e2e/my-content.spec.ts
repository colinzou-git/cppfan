import { expect, test } from "@playwright/test";

/**
 * My Content authoring smoke (#487). Runs in the default e2e environment where
 * Supabase is not configured, so requireOwnerSession renders the pages in
 * local-only mode instead of redirecting to login. Exercises the entry point,
 * the editor's local autosave fallback, and the AI panel's save-first guard.
 */
test.describe("My Content authoring (#487)", () => {
  test("lists an empty library and links to the lesson editor", async ({ page }) => {
    await page.goto("/my-content");

    await expect(page.getByRole("heading", { name: "My Content" })).toBeVisible();
    await expect(page.getByText(/have not created any content yet/i)).toBeVisible();

    await page.getByRole("link", { name: /create a lesson/i }).first().click();
    await expect(page).toHaveURL(/\/my-content\/lessons\/new$/);
    await expect(page.getByRole("heading", { name: "New lesson" })).toBeVisible();
  });

  test("saves a draft locally when no backend is configured", async ({ page }) => {
    await page.goto("/my-content/lessons/new");

    await page.getByPlaceholder("Lesson title").fill("Pointers vs references");
    await page.getByPlaceholder("Teach the concept…").fill("A reference is an alias.");
    await page.getByRole("button", { name: /save draft/i }).click();

    await expect(page.getByText(/saved locally only/i)).toBeVisible();
  });

  test("the AI assistant asks for a saved draft before proposing changes", async ({ page }) => {
    await page.goto("/my-content/lessons/new");

    await expect(page.getByText("AI authoring assistant")).toBeVisible();
    await page
      .getByPlaceholder(/Add a common-mistakes section/i)
      .fill("Add two learning objectives");
    await page.getByRole("button", { name: /ask ai/i }).click();

    await expect(page.getByText(/save a draft first/i)).toBeVisible();
  });
});
