import { expect, test } from "@playwright/test";

// #448: lesson pages show a compact "Further reading" panel with 1-3 curated
// external resources from the /resources catalog. Runs signed-out, no AI.

test("a graph lesson shows curated further-reading links", async ({ page }) => {
  await page.goto("/learn/dsa.graphs.representation.lesson");
  await expect(page.getByTestId("learning-item")).toBeVisible();

  const panel = page.getByTestId("further-reading");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/further reading/i);

  // At least one external link that opens in a new tab.
  const link = panel.getByTestId("further-reading-link").first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
});

test("a C++ lesson shows further-reading links", async ({ page }) => {
  await page.goto("/learn/cpp.program_basics.structure.lesson");
  await expect(page.getByTestId("learning-item")).toBeVisible();
  await expect(page.getByTestId("further-reading")).toBeVisible();
});
