import { expect, test } from "@playwright/test";
import {
  createAuthenticatedLearner,
  hasAuthenticatedE2EEnv
} from "./helpers/authenticated-learner";

test.describe("authenticated My Content AI save and publish", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("applies structured AI fields and publishes them during the autosave window", async ({
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const page = await context.newPage();
      await page.route("**/api/ai/author", async (route) => {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            proposal: {
              summary: "Add the requested lesson structure",
              operations: [
                {
                  id: "op-0",
                  type: "set_objectives",
                  value: ["Use pointers safely"]
                },
                {
                  id: "op-1",
                  type: "append_section",
                  section: "commonMistakes",
                  value: "Do not dereference a null pointer."
                }
              ]
            }
          })
        });
      });

      await page.goto("/my-content/lessons/new", { waitUntil: "networkidle" });
      await page.getByPlaceholder("Lesson title").fill("PW AI persistence lesson");
      await page.getByPlaceholder("Teach the concept…").fill("Pointers store addresses.");
      await page
        .getByPlaceholder(/Why it matters/i)
        .fill("Invalid addresses cause undefined behavior.");
      await page.getByRole("button", { name: /save draft/i }).click();
      await expect(page.getByText("Saved.")).toBeVisible();

      await page
        .getByPlaceholder(/common-mistakes section/i)
        .fill("Add one objective and a common mistake");
      await page.getByRole("button", { name: /ask ai/i }).click();
      await expect(page.getByText(/Set 1 learning objective/i)).toBeVisible();
      await page.getByRole("button", { name: /apply selected/i }).click();

      // Publish immediately, before the 1.5-second autosave debounce can fire.
      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByText("Published.")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Could not save/i)).toHaveCount(0);

      await page.getByRole("link", { name: "Preview" }).click();
      await expect(page.getByRole("heading", { name: "Learning objectives" })).toBeVisible();
      await expect(page.getByText("Use pointers safely")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Common mistakes" })).toBeVisible();
      await expect(page.getByText("Do not dereference a null pointer.")).toBeVisible();
    } finally {
      await learner.cleanup();
    }
  });
});
