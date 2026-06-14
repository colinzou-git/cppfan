import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// #99: automated accessibility regression gate. Scan representative routes with
// axe-core and fail on serious/critical violations. These routes render the same
// content signed-out (CI has no Supabase session), so they are stable to scan;
// authenticated learn/review interaction flows belong with the auth e2e suite
// (#96). Runs across whichever Playwright project executes (desktop + mobile).

const ROUTES = ["/", "/login", "/resources", "/labs", "/review"] as const;

const SEVERE = new Set(["serious", "critical"]);

for (const route of ROUTES) {
  test(`no serious/critical accessibility violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    // Wait for the main content to render before scanning.
    await expect(page.locator("body")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const severe = results.violations.filter((v) => SEVERE.has(v.impact ?? ""));
    const summary = severe
      .map((v) => `${v.id} (${v.impact}) [${v.nodes.length}]: ${v.help}`)
      .join("\n");

    expect(severe, `serious/critical a11y violations on ${route}:\n${summary}`).toEqual([]);
  });
}
