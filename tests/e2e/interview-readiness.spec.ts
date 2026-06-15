import { expect, test } from "@playwright/test";

// #180: the readiness report surfaces the pure dimension-level model. Signed-out
// (no persisted evidence) it honestly shows the explicit not-enough-evidence
// state and the per-dimension breakdown — never a single opaque pass/fail.

test("the interview catalog links to the readiness report", async ({ page }) => {
  await page.goto("/interview");
  await page.getByTestId("readiness-link").click();
  await expect(page).toHaveURL(/\/interview\/readiness$/);
  await expect(page.getByTestId("readiness-status")).toBeVisible();
});

test("with no evidence the report shows the explicit not-enough-evidence state", async ({ page }) => {
  await page.goto("/interview/readiness");

  const status = page.getByTestId("readiness-status");
  await expect(status).toHaveAttribute("data-verdict", "not_enough_evidence");
  await expect(page.getByTestId("readiness-not-enough")).toBeVisible();

  // Dimension-level breakdown is shown (not one opaque number), plus the disclaimer.
  await expect(page.getByTestId("readiness-dimension").first()).toBeVisible();
  await expect(page.getByTestId("readiness-disclaimer")).toBeVisible();

  // The extra skill facets are reported (unrated when signed-out) without gating.
  await expect(page.getByTestId("readiness-facets")).toBeVisible();
  await expect(page.getByTestId("readiness-facet")).toHaveCount(7);
  await expect(
    page.locator('[data-testid="readiness-facet"][data-facet-id="time_management"]')
  ).toHaveAttribute("data-facet-band", "unrated");

  // The timing breakdown is present with an honest empty state (no timings logged).
  await expect(page.getByTestId("readiness-timing")).toBeVisible();
  await expect(page.getByTestId("readiness-timing-empty")).toBeVisible();
});
