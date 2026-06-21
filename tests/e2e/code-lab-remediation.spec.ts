import { expect, test } from "@playwright/test";

// #414: a deterministic error-tag remediation recommendation after a failing
// run on an arrays-traversal Code Lab task. Editing the code to print the wrong
// output fails the "First and last element boundary" test, which the classifier
// (#412) tags as cpp.loop.off_by_one → a dismissible recommendation appears.
// Runs signed-out, mock runner, no AI.

const ITEM = "/learn/dsa.arrays.traversal.code_reading";

test("a failing boundary test surfaces a dismissible remediation recommendation", async ({ page }) => {
  await page.goto(ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  // Break the output via Monaco's API so the boundary test fails deterministically.
  await page.waitForFunction(() =>
    Boolean((window as Window & { __cppfanCodeLabEditor?: unknown }).__cppfanCodeLabEditor)
  );
  await page.evaluate(() => {
    (window as Window & { __cppfanCodeLabEditor?: { setValue(v: string): void } }).__cppfanCodeLabEditor!.setValue(
      '#include <iostream>\nint main() { std::cout << "WRONG" << "\\n"; }'
    );
  });

  await page.getByRole("button", { name: "Run Tests" }).click();
  await expect(page.getByTestId("code-test-results")).toBeVisible();

  const remediation = page.getByTestId("code-remediation");
  await expect(remediation).toBeVisible();
  await expect(remediation).toContainText(/Recommended next/i);
  await expect(remediation).toContainText(/Reason:/i);

  // No hard lock: it is dismissible and Run still works afterwards.
  await page.getByTestId("code-remediation-dismiss").click();
  await expect(remediation).toHaveCount(0);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-output")).toBeVisible();
});
