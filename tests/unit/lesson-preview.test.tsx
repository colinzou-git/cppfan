import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPreview } from "@/features/user-content/lesson-preview";
import type { LessonPayload } from "@/features/user-content/user-content-types";

function payload(overrides: Partial<LessonPayload> = {}): LessonPayload {
  return {
    schemaVersion: 1,
    itemType: "lesson",
    title: "Pointers vs references",
    content: "A reference is an alias.",
    explanation: "References cannot be rebound.",
    ...overrides
  };
}

describe("LessonPreview (#487)", () => {
  it("renders the lesson title with the User-Created badge", () => {
    render(<LessonPreview payload={payload()} status="draft" />);
    expect(screen.getByRole("heading", { name: /pointers vs references/i })).toBeTruthy();
    expect(screen.getByText("User-Created")).toBeTruthy();
  });

  it("shows the explanation inline for a lesson", () => {
    render(<LessonPreview payload={payload()} status="draft" />);
    expect(screen.getByText(/references cannot be rebound/i)).toBeTruthy();
    // no author-preview disclosure for instructional item types
    expect(screen.queryByText(/author preview/i)).toBeNull();
  });

  it("lists choices without revealing the correct one and gates the explanation for graded types", () => {
    render(
      <LessonPreview
        payload={payload({
          itemType: "multiple_choice",
          choices: [
            { text: "Alias to an existing object", isCorrect: true },
            { text: "A nullable handle", isCorrect: false }
          ],
          explanation: "The first option is correct."
        })}
        status="published"
      />
    );
    expect(screen.getByText(/alias to an existing object/i)).toBeTruthy();
    // correctness must not leak into the learner-facing markup
    expect(screen.queryByText(/correct/i, { selector: "li" })).toBeNull();
    // explanation is behind an author-only disclosure, not shown inline
    expect(screen.getByText(/author preview/i)).toBeTruthy();
  });
});
