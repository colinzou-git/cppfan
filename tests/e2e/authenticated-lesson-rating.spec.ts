import { expect, test } from "@playwright/test";
import {
  createAuthenticatedLearner,
  hasAuthenticatedE2EEnv
} from "./helpers/authenticated-learner";

const LESSON_URL = "/learn/cpp.program_basics.structure.lesson";

test.describe("authenticated lesson completion and FSRS review (#687)", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase auth env");

  test("rates a Daily New lesson, advances normally, recalls it later, and hydrates a user lesson", async ({
    page,
    context,
    baseURL
  }) => {
    const learner = await createAuthenticatedLearner(context, baseURL ?? "http://127.0.0.1:3000");
    test.info().annotations.push({ type: "learner", description: learner.userId });

    try {
      await learner.createStudyGoal({
        skillId: "cpp.program_basics.structure",
        skillTitle: "A minimal C++ program",
        title: "Learn program structure"
      });

      await page.goto("/dashboard");
      const dailyNew = page.getByTestId("daily-new-for-goals");
      const lessonLink = dailyNew.getByRole("link", { name: /A minimal C\+\+ program/i });
      await expect(lessonLink).toBeVisible();
      await lessonLink.click();

      const panel = page.getByTestId("lesson-completion-rating");
      await expect(panel).toBeVisible();
      await expect(panel.getByRole("button", { name: "Hard" })).toBeVisible();
      await expect(panel.getByRole("button", { name: "Good" })).toBeVisible();
      await expect(panel.getByRole("button", { name: "Mastered" })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
        )
      ).toBe(true);

      // Leaving through normal navigation writes nothing and leaves the exact
      // lesson as the next unfinished Daily New action.
      await page
        .getByRole("link", { name: /back to dashboard/i })
        .first()
        .click();
      await expect(dailyNew.getByRole("link", { name: /A minimal C\+\+ program/i })).toBeVisible();
      await dailyNew.getByRole("link", { name: /A minimal C\+\+ program/i }).click();

      await page.getByTestId("lesson-rate-hard").click();
      const saved = page.getByTestId("lesson-rating-scheduled");
      await expect(saved).toContainText(/lesson completed/i);
      await expect(saved).toContainText(/next review scheduled/i);
      await saved.getByRole("link", { name: /back to dashboard/i }).click();

      await expect(dailyNew.getByRole("link", { name: /A minimal C\+\+ program/i })).toHaveCount(0);
      await expect(dailyNew.getByRole("link", { name: /Where a program starts/i })).toBeVisible();

      const initialEvidence = await learner.lessonRatingEvidence(
        "cpp.program_basics.structure.lesson"
      );
      expect(initialEvidence.card?.reps).toBe(1);
      expect(initialEvidence.logs).toHaveLength(1);
      expect(initialEvidence.logs[0]?.rating).toBe("hard");
      expect(
        initialEvidence.events.filter((event) => event.event_type === "lesson_self_assessed")
      ).toHaveLength(1);
      expect(initialEvidence.events.some((event) => event.event_type === "skill_mastered")).toBe(
        false
      );

      await page.goto(LESSON_URL);
      await expect(page.getByTestId("lesson-rating-scheduled")).toBeVisible();
      await expect(page.getByTestId("lesson-rating-choices")).toHaveCount(0);

      await learner.makeReviewDue("cpp.program_basics.structure.lesson");
      await page.goto("/dashboard");
      await page.getByTestId("daily-review").getByRole("link").click();
      await expect(page.getByTestId("review-prompt")).toContainText(/explain its key idea/i);
      await expect(page.getByText(/execution begins in int main/i)).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Mastered" })).toHaveCount(0);

      await page.getByTestId("review-reveal").click();
      await expect(page.getByTestId("review-lesson-content")).toContainText(/execution begins in/i);
      await expect(page.getByRole("button", { name: "Again" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Mastered" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Easy" })).toHaveCount(0);
      await page.getByRole("button", { name: "Again" }).click();
      await expect(page.getByTestId("review-empty")).toBeVisible();

      const laterEvidence = await learner.lessonRatingEvidence(
        "cpp.program_basics.structure.lesson"
      );
      expect(laterEvidence.logs.map((log) => log.rating)).toEqual(["hard", "again"]);

      // A projected owner lesson is absent from the bundled seed. Completing it
      // and reopening it from Review proves the queue hydrates database-first.
      const userLesson = await learner.seedPublishedLesson();
      await page.goto(`/learn/${encodeURIComponent(userLesson.itemId)}`);
      await page.getByTestId("lesson-rate-mastered").click();
      await expect(page.getByTestId("lesson-rating-scheduled")).toBeVisible();
      const userEvidence = await learner.lessonRatingEvidence(userLesson.itemId);
      expect(userEvidence.logs[0]?.rating).toBe("easy");
      await learner.makeReviewDue(userLesson.itemId);

      await page.goto("/review");
      await expect(page.getByRole("heading", { name: userLesson.title })).toBeVisible();
      await expect(page.getByText(userLesson.content)).toHaveCount(0);
      await page.getByTestId("review-reveal").click();
      await expect(page.getByTestId("review-lesson-content")).toContainText(userLesson.content);
      await expect(page.getByRole("button", { name: "Mastered" })).toBeVisible();
    } finally {
      await learner.cleanup();
    }
  });
});
