import { expect, test } from "@playwright/test";

// #447: the redesigned /exercises page has a dark left-nav shell with Exercises
// active and a clean header titled "Exercises". Runs signed-out, no AI.

const NAV_LABELS = [
  "Review",
  "Resources",
  "Labs",
  "Placement",
  "Exercises",
  "Interview",
  "Profile",
  "Settings",
  "Auth Setup"
];

test("the exercises page has a left-nav shell with Exercises active", async ({ page, viewport }) => {
  await page.goto("/exercises");

  await expect(page.getByRole("heading", { name: "Exercises" })).toBeVisible();

  // The left nav is desktop-only (lg: ≥1024px); on phones/tablets it is hidden.
  test.skip((viewport?.width ?? 0) < 1024, "left nav is desktop-only");

  const nav = page.getByTestId("exercises-nav");
  await expect(nav).toBeVisible();
  for (const label of NAV_LABELS) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }

  // Exercises is the active item.
  const active = page.getByTestId("exercises-nav-active");
  await expect(active).toHaveText(/Exercises/);
  await expect(active).toHaveAttribute("aria-current", "page");
});

test("a left-nav item links to another section", async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, "left nav is desktop-only");
  await page.goto("/exercises");
  await page.getByTestId("exercises-nav").getByRole("link", { name: "Interview" }).click();
  await expect(page).toHaveURL(/\/interview/);
});
