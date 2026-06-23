import { expect, test } from "@playwright/test";
import {
  attachPageAudit,
  expectNoRawMarkdownArtifacts,
  expectVisibleAndEnabled
} from "./helpers/page-audit";

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
        test(`${auditCase.path} loads without obvious UI/runtime bugs`, async ({ page }, testInfo) => {
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
            await expectVisibleAndEnabled(buttons.nth(index));
          }

          await assertAuditClean();
        });
      }
    });
  }

  test("dashboard either loads or redirects to the auth/onboarding flow", async ({ page }, testInfo) => {
    const assertAuditClean = attachPageAudit(page, testInfo);
    await page.goto("/dashboard");

    const dashboard = page.getByRole("heading", { name: /your learning dashboard/i });
    if (await dashboard.isVisible().catch(() => false)) {
      await expect(page.getByTestId("daily-review")).toBeVisible();
      await expectNoRawMarkdownArtifacts(page);
    } else {
      await expect(page).toHaveURL(/\/login|\/onboarding/);
    }

    await assertAuditClean();
  });
});
