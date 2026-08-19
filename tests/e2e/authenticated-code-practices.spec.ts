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

async function getEditor(page: Page): Promise<string> {
  await page.waitForFunction(() => Boolean((window as EditorWindow).__cppfanCodeLabEditor));
  return page.evaluate(() => (window as EditorWindow).__cppfanCodeLabEditor?.getValue?.() ?? "");
}

test.describe("saved lesson Code Lab practices (#674, #684)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase");

  test("keeps named practice, working draft, and cppFan sample isolated", async ({
    context,
    baseURL
  }) => {
    // This scenario intentionally exercises a long sequence across the embedded
    // and full-screen editors. Mobile WebKit can exceed the default 30-second
    // total test budget even though each interaction remains responsive.
    test.setTimeout(90_000);

    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      const itemId = "cpp.values_types.variables.sample_code";
      const workingDraftSource = `#include <iostream>\nint main(){ std::cout << "working-draft-marker"; }`;
      const practiceSource = `#include <iostream>\nint main(){ std::cout << "practice-marker"; }`;
      const updatedPracticeSource = `#include <iostream>\nint main(){ std::cout << "updated-practice"; }`;

      await page.goto(`/learn/${encodeURIComponent(itemId)}`);
      await expect(page.getByTestId("code-practice-manager")).toBeVisible();
      const canonicalSource = await getEditor(page);
      expect(canonicalSource).toContain("Practice: Variables, types, and initialization");

      // Establish an ordinary draft, then snapshot it as a named practice. Once
      // the practice becomes active, later practice edits must not mutate this
      // ordinary draft (#684).
      await setEditor(page, workingDraftSource);
      await page.getByTestId("code-practice-create").click();
      const nameInput = page.getByTestId("code-practice-name-input");
      await expect(nameInput).toHaveValue("Practice 1");
      await nameInput.fill("std::accumulate experiments");
      await page.getByRole("button", { name: "Save Practice", exact: true }).last().click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );

      // Change and save the named practice so it is observably different from
      // both the ordinary draft and canonical cppFan source.
      await setEditor(page, practiceSource);
      await expect(page.getByTestId("code-practice-dirty")).toBeVisible();
      await page.getByTestId("code-practice-save").click();
      await expect(page.getByTestId("code-practice-dirty")).toBeHidden();

      // Current reference must be the exact canonical starter, never the active
      // practice or working draft. Reference code remains read-only/non-runnable.
      await page.getByTestId("code-practice-view-current").click();
      await expect(page.getByTestId("code-practice-reference-message")).toBeVisible();
      expect(await getEditor(page)).toBe(canonicalSource);
      await expect(
        page.getByTestId("code-controls").getByRole("button", { name: "Run", exact: true })
      ).toBeDisabled();
      await page.getByTestId("code-practice-view-learner").click();
      expect(await getEditor(page)).toBe(practiceSource);

      // Returning to Working Draft restores the pre-practice ordinary draft.
      await page.getByRole("button", { name: "Return to working draft", exact: true }).click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText("Working draft");
      expect(await getEditor(page)).toBe(workingDraftSource);

      // Reopen the saved practice. Merely opening it must not replace the hidden
      // ordinary draft that will be restored after the practice session.
      await page.getByTestId("code-practice-list").getByRole("button", { name: "Open" }).click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );
      expect(await getEditor(page)).toBe(practiceSource);

      // Full screen keeps the active practice identity in the URL and reloads it.
      const fullScreen = page.getByTestId("code-lab-open-full");
      await expect(fullScreen).toHaveAttribute("href", /\?practice=/);
      await fullScreen.click();
      await expect(page).toHaveURL(/\/lab\/cpp\.values_types\.variables\.sample_code\?practice=/);
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );
      expect(await getEditor(page)).toBe(practiceSource);

      await setEditor(page, updatedPracticeSource);
      await expect(page.getByTestId("code-practice-dirty")).toBeVisible();
      await page.getByTestId("code-practice-save").click();
      await expect(page.getByTestId("code-practice-dirty")).toBeHidden();

      await page.reload();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "std::accumulate experiments"
      );
      expect(await getEditor(page)).toBe(updatedPracticeSource);

      // Navigating away while a practice is active must persist the ordinary
      // draft snapshot, not the practice source. Back on the lesson, the normal
      // Working Draft is still the pre-practice source.
      await page.getByRole("link", { name: "Back to lesson", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/learn/${itemId.replaceAll(".", "\\.")}$`));
      await expect(page.getByTestId("code-practice-active-name")).toHaveText("Working draft");
      expect(await getEditor(page)).toBe(workingDraftSource);

      // Reopening proves the named practice also retained its independently saved
      // source after the full-screen unmount/reload cycle.
      await page.getByTestId("code-practice-list").getByRole("button", { name: "Open" }).click();
      expect(await getEditor(page)).toBe(updatedPracticeSource);

      await page.getByRole("button", { name: "Rename", exact: true }).click();
      await page.getByTestId("code-practice-name-input").fill("accumulate boundary experiments");
      await page.getByRole("button", { name: "Rename", exact: true }).last().click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText(
        "accumulate boundary experiments"
      );

      // Deletion intentionally preserves the current editor source as the new
      // ordinary working draft, matching #674's existing delete semantics.
      await page.getByRole("button", { name: "Delete", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Delete saved practice?" })).toContainText(
        "accumulate boundary experiments"
      );
      await page
        .getByRole("dialog", { name: "Delete saved practice?" })
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(page.getByTestId("code-practice-active-name")).toHaveText("Working draft");
      await expect(page.getByTestId("code-practice-list")).toHaveCount(0);
      expect(await getEditor(page)).toBe(updatedPracticeSource);
    } finally {
      await learner.cleanup();
    }
  });
});
