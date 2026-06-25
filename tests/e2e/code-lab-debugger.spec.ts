import { expect, test } from "@playwright/test";

// #442: the Code Lab Debug tab on the full-page workspace (/lab/<itemId>). Runs
// signed-out with no debugger configured (CODE_DEBUGGER_PROVIDER unset), so the
// tab is present and breakpoints work, and Start Debugging returns a friendly
// "unconfigured" state instead of failing.

const LAB_ITEM = "/lab/cpp.program_basics.structure.lesson";

test("the Debug tab persists breakpoints and degrades gracefully when unconfigured", async ({ page }) => {
  await page.goto(LAB_ITEM);
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();

  // The Debug tab exists in the right dock.
  await page.getByTestId("code-lab-tab-debug").click();
  await expect(page.getByTestId("code-debug")).toBeVisible();

  // Add a breakpoint via the iPhone/iPad-friendly line-number control.
  await page.getByTestId("code-debug-line-input").fill("3");
  await page.getByTestId("code-debug-add-breakpoint").click();
  await expect(page.getByTestId("code-debug-breakpoints")).toContainText("Line 3");

  // The breakpoint renders a marker in the Monaco gutter.
  await expect(page.locator(".cppfan-breakpoint-glyph").first()).toBeVisible();

  // Breakpoints persist per item across a reload.
  await page.reload();
  await expect(page.getByTestId("code-lab-workspace")).toBeVisible();
  await page.getByTestId("code-lab-tab-debug").click();
  await expect(page.getByTestId("code-debug-breakpoints")).toContainText("Line 3");

  // Start Debugging with no service configured shows the unconfigured state.
  await page.getByTestId("code-debug-start").click();
  await expect(page.getByTestId("code-debug-status")).toContainText(/unconfigured|not configured/i);

  // The other dock tabs still work.
  await page.getByTestId("code-lab-tab-output").click();
  await expect(page.getByText(/Run your program to see/i)).toBeVisible();
});
