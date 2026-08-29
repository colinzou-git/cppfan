import { expect, test } from "@playwright/test";

const CASES = [
  ["iv.trie.prefix-index", /prefix index|prefix query/i],
  ["iv.dp.edit-distance", /minimum.*edit|insertions.*deletions/i],
  ["iv.graph.zero-one-grid-route", /zero-one|0-1|minimum total entry cost/i]
] as const;

for (const [id, prompt] of CASES) {
  test(`#693 interview expansion opens Code Lab for ${id}`, async ({ page }) => {
    await page.goto(`/lab/${id}`);
    const workspace = page.getByTestId("code-lab-workspace");
    await expect(workspace).toBeVisible();
    await expect(workspace).toContainText(prompt);
    await expect(workspace).toContainText(/stdin:/i);
    await expect(page.getByTestId("code-editor")).toBeVisible();
    await expect(page.getByTestId("code-lab-tab-tests")).toBeVisible();
  });
}
