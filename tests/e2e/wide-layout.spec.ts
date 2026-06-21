import { expect, test, type Locator } from "@playwright/test";

// #433: wide-screen (1920x1080) layout smoke tests. They assert stable bounding-
// box relationships — "is the right rail actually to the right" — not pixel-
// perfect screenshots, to catch regressions where a desktop layout collapses back
// to one narrow phone column. They run only in the `wide-desktop` project and
// never require Supabase credentials.

test.describe("wide desktop responsive layout", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "wide-desktop",
      "wide layout assertions only run in the wide-desktop project"
    );
  });

  async function box(locator: Locator) {
    await expect(locator).toBeVisible();
    const b = await locator.boundingBox();
    expect(b).not.toBeNull();
    return b!;
  }

  test("dashboard uses desktop columns (or shows an auth gate)", async ({ page }) => {
    await page.goto("/dashboard");
    const heading = page.getByRole("heading", { name: /your learning dashboard/i });
    if (!(await heading.isVisible().catch(() => false))) {
      await expect(page).toHaveURL(/\/login|\/onboarding/);
      return;
    }

    const review = await box(page.getByTestId("daily-review"));
    const mastery = await box(page.getByTestId("mastery-preview"));
    const skillMap = await box(page.getByTestId("skill-map-preview"));

    // The right panel (mastery) sits to the right of the main review column.
    expect(mastery.x).toBeGreaterThan(review.x + review.width * 0.6);
    // The skill map stays in the main left column, left of the right rail.
    expect(skillMap.x).toBeLessThan(mastery.x);
  });

  test("a Code Lab learning item splits prompt and Code Lab side-by-side", async ({ page }) => {
    await page.goto("/learn/cpp.program_basics.structure.lesson");
    await expect(page.getByTestId("learning-item")).toBeVisible();
    await expect(page.getByTestId("code-lab")).toBeVisible();
    await expect(page.getByTestId("code-editor")).toBeVisible();

    const primary = await box(page.getByTestId("learning-item-primary"));
    const codePane = await box(page.getByTestId("learning-item-code-lab-pane"));
    // Code Lab pane is to the right of the lesson/prompt column, not stacked below.
    expect(codePane.x).toBeGreaterThan(primary.x + primary.width * 0.6);
  });

  test("the exercises catalog forms a desktop card grid", async ({ page }) => {
    await page.goto("/exercises");
    await expect(page.getByTestId("exercise-catalog")).toBeVisible();
    const cards = page.getByTestId("exercise-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(1);

    const first = await box(cards.nth(0));
    const second = await box(cards.nth(1));
    // Two cards on the same row: similar y, second to the right of the first.
    expect(Math.abs(first.y - second.y)).toBeLessThan(30);
    expect(second.x).toBeGreaterThan(first.x + first.width * 0.5);
  });

  test("labs uses wide desktop space with project cards sharing a row", async ({ page }) => {
    await page.goto("/labs");
    await expect(page.getByTestId("capstone-tracks")).toBeVisible();
    const labs = page.getByTestId("project-lab");
    await expect(labs.first()).toBeVisible();
    expect(await labs.count()).toBeGreaterThan(1);

    const first = await box(labs.nth(0));
    const second = await box(labs.nth(1));
    expect(Math.abs(first.y - second.y)).toBeLessThan(30);
    expect(second.x).toBeGreaterThan(first.x + first.width * 0.5);
  });
});
