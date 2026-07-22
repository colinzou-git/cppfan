import { expect, test } from "@playwright/test";

// #408: the Phase 2 "Trace with AI" control on a real Code Lab page. Runs
// signed-out with no AI provider, so the trace returns its graceful
// configured-unavailable state while Run/Test (Phase 1) keep working.

const CODE_ITEM = "/learn/cpp.program_basics.structure.lesson";

test("Trace with AI shows a panel and does not block Run/Test", async ({ page }) => {
  await page.goto(CODE_ITEM);
  await expect(page.getByTestId("code-lab")).toBeVisible();

  // Choose a visible test case to trace, then request the trace.
  await expect(page.getByTestId("trace-controls")).toBeVisible();
  await page.getByTestId("trace-input-select").selectOption({ index: 1 });
  await page.getByTestId("trace-button").click();

  // With no AI provider configured, the graceful unavailable state appears.
  const tracePanel = page.getByTestId("code-ai-trace");
  await expect(tracePanel).toBeVisible();
  await expect(tracePanel).toContainText(/not available|trace/i);

  // Run (interactive Terminal, #664) still works after a trace request.
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByTestId("code-terminal-transcript")).toContainText("Program started");
});
