import { expect, test } from "@playwright/test";

/**
 * User-created exercise authoring smoke (#488). Runs in the default e2e
 * environment where Supabase is unconfigured, so the /my-content routes render
 * in local-only mode. Exercises the entry point, the editor's local autosave
 * fallback, and the code-contract mode toggle. Runs under the desktop / iPhone /
 * iPad Playwright projects for cross-device coverage.
 */
test.describe("My Content exercise authoring (#488)", () => {
  test("links from My Content to the exercise editor", async ({ page }) => {
    await page.goto("/my-content");
    await page.getByRole("link", { name: /create exercise/i }).click();
    await expect(page).toHaveURL(/\/my-content\/exercises\/new$/);
    await expect(page.getByRole("heading", { name: "New exercise" })).toBeVisible();
  });

  test("saves an exercise draft locally when no backend is configured", async ({ page }) => {
    await page.goto("/my-content/exercises/new");
    await page.getByPlaceholder("Exercise title").fill("Reverse a line");
    await page.getByPlaceholder(/Describe the task/i).fill("Read a line and print it reversed.");
    await page.getByRole("button", { name: /save draft/i }).click();
    await expect(page.getByText(/saved locally only/i)).toBeVisible();
  });

  test("switches to function mode and reveals the signature field", async ({ page }) => {
    await page.goto("/my-content/exercises/new");
    // program mode shows an input/output format; function mode shows a signature.
    await expect(page.getByPlaceholder(/What the program reads/i)).toBeVisible();
    await page.getByLabel("Code contract").selectOption("function");
    await expect(page.getByPlaceholder(/std::string solve/i)).toBeVisible();
  });
});
