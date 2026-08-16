import { expect, test, type Page } from "@playwright/test";
import {
  createAuthenticatedLearner,
  hasAuthenticatedE2EEnv
} from "./helpers/authenticated-learner";

type EditorWindow = Window & {
  __cppfanCodeLabEditor?: { setValue(value: string): void; getValue?(): string };
};

async function setEditor(page: Page, source: string) {
  await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
  await page.evaluate(
    (value) => (window as EditorWindow).__cppfanCodeLabEditor!.setValue(value),
    source
  );
}

test.describe("saved lesson Code Lab practices (#674)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase");

  test("creates, revisits, updates, renames, and deletes a named lesson practice", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      const itemId = "cpp.values_types.variables.sample_code";
      const savedSource = `#include <iostream>\nint main(){ std::cout << "saved-practice"; }`;
      const updatedSource = `#include <iostream>\nint main(){ std::cout << "updated-practice"; }`;

      await page.goto(`/learn/${encodeURIComponent(itemId)}`);
      await expect(page.getByTestId("code-practice-manager")).toBeVisible();
      await setEditor(page, savedSource);

      await page.getByTestId("code-practice-create").click();
      const nameInput = page.getByTestId("code-practice-name-input");
      await expect(nameInput).toHaveValue("Practice 1");
      await nameInput.fill("std::accumulate experiments");
      await page.getByRole("button", { name: "Save Practice", exact: true }).last().click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );

      // Reference code is read-only and source-dependent actions cannot run it.
      await page.getByTestId("code-practice-view-current").click();
      await expect(page.getByTestId("code-practice-reference-message")).toBeVisible();
      await expect(page.getByTestId("code-controls").getByRole("button", { name: "Run", exact: true })).toBeDisabled();
      await page.getByTestId("code-practice-view-learner").click();

      // Full screen keeps the active practice identity in the URL and reloads it.
      const fullScreen = page.getByTestId("code-lab-open-full");
      await expect(fullScreen).toHaveAttribute("href", /\?practice=/);
      await fullScreen.click();
      await expect(page).toHaveURL(/\/lab\/cpp\.values_types\.variables\.sample_code\?practice=/);
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );

      await setEditor(page, updatedSource);
      await expect(page.getByTestId("code-practice-dirty")).toBeVisible();
      await page.getByTestId("code-practice-save").click();
      await expect(page.getByTestId("code-practice-dirty")).toBeHidden();

      await page.reload();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );

      await page.getByRole("button", { name: "Rename", exact: true }).click();
      await page.getByTestId("code-practice-name-input").fill("accumulate boundary experiments");
      await page.getByRole("button", { name: "Rename", exact: true }).last().click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "accumulate boundary experiments"
      );

      await page.getByRole("button", { name: "Delete", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Delete saved practice?" })).toContainText(
        "accumulate boundary experiments"
      );
      await page.getByRole("dialog", { name: "Delete saved practice?" }).getByRole("button", { name: "Delete" }).click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText("Working draft");
      await expect(page.getByTestId("code-practice-list")).toHaveCount(0);
    } finally {
      await learner.cleanup();
    }
  });
});
