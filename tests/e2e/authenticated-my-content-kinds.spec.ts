import { expect, test } from "@playwright/test";
import { createAuthenticatedLearner, hasAuthenticatedE2EEnv } from "./helpers/authenticated-learner";

// #606: My Content must be kind-aware for all four content kinds — each row opens
// its own kind-specific editor route (never defaulting to the lesson editor).
// This is the authenticated browser coverage (acceptance criterion 6).
//
// Requires the local Supabase stack; self-skips otherwise.

const KINDS = [
  { kind: "lesson", title: "PW kind lesson", segment: "lessons" },
  { kind: "exercise", title: "PW kind exercise", segment: "exercises" },
  { kind: "lab", title: "PW kind lab", segment: "labs" },
  { kind: "interview_problem", title: "PW kind interview", segment: "interview" }
] as const;

test.describe("authenticated My Content kind-aware routing (#606)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires a local Supabase stack");

  test("each kind's row opens its own kind-specific editor", async ({ context, baseURL }) => {
    const learner = await createAuthenticatedLearner(context, baseURL!);
    try {
      const ids: Record<string, string> = {};
      for (const k of KINDS) {
        const { contentId } = await learner.seedContentDraft({ kind: k.kind, title: k.title });
        ids[k.kind] = contentId;
      }

      const page = await context.newPage();
      await page.goto("/my-content");

      // Every kind appears as its own row linking to its kind-specific edit route.
      for (const k of KINDS) {
        const row = page.locator("li").filter({ hasText: k.title });
        await expect(row).toBeVisible();
        await expect(row.getByRole("link").first()).toHaveAttribute(
          "href",
          new RegExp(`/my-content/${k.segment}/${ids[k.kind]}/edit`)
        );
      }

      // Opening the exercise row lands on the exercise editor — not the lesson one.
      await page.locator("li").filter({ hasText: "PW kind exercise" }).getByRole("link").first().click();
      await expect(page).toHaveURL(new RegExp(`/my-content/exercises/${ids["exercise"]}/edit`));
    } finally {
      await learner.cleanup();
    }
  });
});
