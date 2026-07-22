import { expect, test } from "@playwright/test";
import {
  attachPageAudit,
  focusMonacoAt,
  getMonacoValue,
  setMonacoValue
} from "./helpers/page-audit";

const CODE_LAB_URL = "/learn/cpp.program_basics.structure.lesson#code-lab";

const VALID_CPP = `#include <iostream>

int main() {
  std::cout << "Hello, cppFan!" << "\\n";
  return 0;
}
`;

const INVALID_CPP = `#include <iostream>

int main() {
  std::cout << "broken" << "\\n"
  return 0;
}
`;

test.describe("Code Lab browser QA", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Code Lab Judge0 workflow runs once in desktop Chromium");
  });

  test("editor stays stable, Judge0 compile errors are useful, and run/test works", async ({ page, request }, testInfo) => {
    const healthResponse = await request.get("/api/code/runner-health");
    const health = healthResponse.ok() ? ((await healthResponse.json()) as { provider?: string; reachable?: boolean }) : null;
    test.skip(
      health?.provider !== "judge0" || health?.reachable !== true,
      "requires configured reachable Judge0 runner; page audit tests still run without Judge0"
    );

    const assertAuditClean = attachPageAudit(page, testInfo, {
      allowNetwork: [/\/api\/code\/run/i, /\/api\/code\/test/i]
    });

    await page.goto(CODE_LAB_URL);
    await expect(page.getByTestId("code-lab")).toBeVisible();
    await expect(page.getByTestId("code-editor")).toBeVisible();

    await setMonacoValue(page, VALID_CPP);
    await focusMonacoAt(page, 4, 16);
    await page.keyboard.type("/*MID*/ ");
    const edited = await getMonacoValue(page);
    expect(edited.split("\n")[3]).toContain("/*MID*/");
    expect(edited.trim()).not.toMatch(/\/\*MID\*\/$/);

    await setMonacoValue(page, INVALID_CPP);
    // Run now drives the interactive Terminal (#664); the one-shot Judge0 compile/
    // run pipeline this QA guards is exercised through Run Tests, whose results
    // panel surfaces a compile error just as usefully.
    await page.getByRole("button", { name: /Run Tests/i }).click();

    const output = page.getByTestId("code-test-results");
    await expect(output).toBeVisible({ timeout: 25_000 });
    await expect(output).toContainText(/Compile error|did not compile|error:|expected|before|return/i, {
      timeout: 25_000
    });
    const invalidText = (await output.textContent()) ?? "";
    expect(invalidText).not.toMatch(/status unknown|unknown: unknown|cannot be converted to UTF-8|HTTP 400/i);

    await setMonacoValue(page, VALID_CPP);
    await page.getByRole("button", { name: /Run Tests/i }).click();
    const tests = page.getByTestId("code-test-results");
    await expect(tests).toBeVisible({ timeout: 35_000 });
    await expect(page.getByTestId("code-test-summary")).toContainText(/tests passed/i);
    const summary = (await page.getByTestId("code-test-summary").textContent()) ?? "";
    expect(summary).toMatch(/^(\s*)\d+\/\d+ tests passed/);
    expect(summary).not.toMatch(/^\s*0\//);

    const recommendation = page.getByTestId("scaffold-recommendation-link");
    if ((await recommendation.count()) > 0 && (await recommendation.first().isVisible())) {
      await recommendation.first().click();
      await expect(page).toHaveURL(/#code-lab$/);
      await expect(page.getByTestId("code-lab")).toBeVisible();
    }

    await assertAuditClean();
  });
});
