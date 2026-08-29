import { expect, test } from "@playwright/test";

// #690: the curated C++ interview-question expansion adds 30 executable
// cpp_implementation problems. Each must appear automatically as a code-capable
// full-page Code Lab (/lab/<interviewProblemId>) with its prompt, constraints,
// executable I/O contract, and a starter scaffold — no per-problem manual
// registration. Runs signed-out with the default deterministic runner; the real
// visible/hidden judge round-trip is exercised by scripts/verify-interview-catalog.mjs
// (every fixture compiled and executed under gcc c++17/c++20) and by the durable
// judge worker (#652), not by this public browser path.

const CASES = [
  {
    id: "iv.cpp.move-only-buffer",
    // Distinctive prompt text for a value/ownership-semantics problem.
    prompt: /move-only owning buffer|uniquely owns/i
  },
  {
    id: "iv.cpp.thread-safe-counter",
    // Distinctive prompt text for a concurrency problem.
    prompt: /shared counter|data race/i
  }
];

for (const problem of CASES) {
  test(`new C++ interview problem ${problem.id} opens a code-capable Code Lab`, async ({ page }) => {
    await page.goto(`/lab/${problem.id}`);

    const workspace = page.getByTestId("code-lab-workspace");
    await expect(workspace).toBeVisible();

    // The prompt and its executable I/O contract render for the problem.
    await expect(workspace).toContainText(problem.prompt);
    await expect(workspace).toContainText(/stdin:/i);

    // A starter scaffold is present (never a full solution).
    await expect(page.getByTestId("code-editor")).toBeVisible();
    await expect(workspace).toContainText("int main()");

    // The Debug tab is available automatically, like other full-page labs.
    await expect(page.getByTestId("code-lab-tab-debug")).toBeVisible();
  });
}
