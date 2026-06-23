import { expect, test } from "@playwright/test";
import { attachPageAudit, expectNoRawMarkdownArtifacts } from "./helpers/page-audit";

type PageAuditCase = {
  path: string;
  heading?: RegExp;
  testId?: string;
  minLinks?: number;
};

const PUBLIC_PAGES: PageAuditCase[] = [
  { path: "/", heading: /cppfan|learn/i, minLinks: 1 },
  { path: "/exercises", testId: "exercise-catalog", minLinks: 1 },
  { path: "/labs", testId: "capstone-tracks", minLinks: 1 },
  { path: "/learn/cpp.program_basics.structure.lesson", testId: "learning-item", heading: /minimal c\+\+ program/i },
  { path: "/learn/cpp.program_basics.io.lesson", testId: "learning-item", heading: /input|output|read/i },
  { path: "/learn/cpp.program_basics.statements_comments.lesson", testId: "learning-item" }
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "ipad", width: 1024, height: 768 },
  { name: "iphone", width: 390, height: 844 }
];

test.describe("automatic page QA audit", () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const auditCase of PUBLIC_PAGES) {
        test(`${auditCase.path} loads without obvious UI runtime bugs`, async ({ page }, testInfo) => {
          const assertAuditClean = attachPageAudit(page, testInfo);

          await page.goto(auditCase.path);
          await expect(page.locator("body")).toBeVisible();

          if (auditCase.testId) {
            await expect(page.getByTestId(auditCase.testId)).toBeVisible();
          }

          if (auditCase.heading) {
            await expect(page.getByRole("heading", { name: auditCase.heading }).first()).toBeVisible();
          }

          await expectNoRawMarkdownArtifacts(page);

          const links = page.getByRole("link");
          if (auditCase.minLinks) {
            expect(await links.count()).toBeGreaterThanOrEqual(auditCase.minLinks);
          }

          const buttons = page.getByRole("button");
          const buttonCount = await buttons.count();
          for (let index = 0; index < Math.min(buttonCount, 5); index += 1) {
            await expect(buttons.nth(index)).toBeVisible();
          }

          await assertAuditClean();
        });
      }
    });
  }

  test("dashboard either loads or redirects to auth flow", async ({ page }, testInfo) => {
    const assertAuditClean = attachPageAudit(page, testInfo);
    await page.goto("/dashboard");

    const dashboard = page.getByRole("heading", { name: /your learning dashboard/i });
    if (await dashboard.isVisible().catch(() => false)) {
      await expect(page.getByTestId("daily-review")).toBeVisible();
      await expectNoRawMarkdownArtifacts(page);
    } else {
      const url = page.url();
      expect(url.includes("/login") || url.includes("/onboarding")).toBe(true);
    }

    await assertAuditClean();
  });
});
