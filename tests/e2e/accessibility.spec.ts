import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { monitorBrowserErrors } from "./helpers/browser-errors";

const ROUTES = [
  "/",
  "/login",
  "/resources",
  "/labs",
  "/review",
  "/placement",
  "/goals",
  "/goals/evaluation",
  "/exercises",
  "/interview",
  "/interview/diagnostic",
  "/interview/session",
  "/interview/mocks",
  "/interview/rubric",
  "/interview/readiness",
  "/interview/log",
  "/interview/plan",
  "/interview/progress"
] as const;

const SEVERE = new Set(["serious", "critical"]);

for (const route of ROUTES) {
  test(`no serious/critical accessibility or runtime errors on ${route}`, async ({ page }) => {
    const browserErrors = monitorBrowserErrors(page);
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const severe = results.violations.filter((item) => SEVERE.has(item.impact ?? ""));
    const summary = severe
      .map((item) => `${item.id} (${item.impact}) [${item.nodes.length}]: ${item.help}`)
      .join("\n");

    expect(severe, `serious/critical a11y violations on ${route}:\n${summary}`).toEqual([]);
    browserErrors.assertNoErrors();
  });
}
