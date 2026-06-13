import { expect, test } from "@playwright/test";

test("the resources page lists curated external links", async ({ page }) => {
  await page.goto("/resources");

  await expect(page.getByRole("heading", { name: /c\+\+ .* dsa resources/i })).toBeVisible();
  await expect(page.getByTestId("resource-group").first()).toBeVisible();

  const learncpp = page.getByTestId("resource-link").filter({ hasText: "LearnCpp" });
  await expect(learncpp).toBeVisible();
  await expect(learncpp).toHaveAttribute("href", "https://www.learncpp.com");
  await expect(learncpp).toHaveAttribute("target", "_blank");
});
