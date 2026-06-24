import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExerciseCatalogView } from "@/features/exercises/exercise-catalog-view";
import type { ExerciseView } from "@/features/exercises/exercise-view";

vi.mock("@/features/exercises/exercise-actions", () => ({
  setExercise: vi.fn()
}));

const exercise: ExerciseView = {
  id: "dsa-two-sum-sorted",
  title: "DSA: two-sum on a sorted array",
  skillIds: ["dsa.arrays.two_pointers", "dsa.complexity.big_o"],
  skillTitles: ["Two pointers", "Big-O"],
  difficulty: "intermediate",
  estimatedMinutes: 25,
  editableFiles: ["two_sum.hpp"],
  requiredTests: ["test_finds_pair"],
  hints: ["Use two pointers."],
  projectLab: "csv-table-summarizer"
};

function renderView() {
  return render(
    <ExerciseCatalogView exercises={[exercise]} initialProgress={[]} authenticated={false} />
  );
}

describe("ExerciseCatalogView (#440)", () => {
  it("uses in-app-first intro text and drops the outdated wording", () => {
    renderView();
    expect(screen.getByText(/editing code directly in cppFan/i)).toBeInTheDocument();
    expect(screen.queryByText(/cppFan never runs your code/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Codespace or your own editor/i)).not.toBeInTheDocument();
  });

  it("renders a Code button linking to the exercise-level Code Lab", () => {
    renderView();
    const code = screen.getByTestId("exercise-code");
    const href = code.getAttribute("href") ?? "";
    expect(href).toBe("/lab/dsa-two-sum-sorted");
    expect(href).not.toContain("csv-table-summarizer");
  });

  it("shows built-in editor first with advanced local workflow collapsed", async () => {
    renderView();
    fireEvent.click(screen.getByTestId("exercise-instructions-toggle"));
    const panel = await screen.findByTestId("exercise-instructions");
    expect(panel).toHaveTextContent(/built-in editor/i);
    expect(within(panel).getByText(/Advanced local workflow/i).tagName.toLowerCase()).toBe("summary");
  });

  it("keeps AI Chat scoped to the write-code exercise", () => {
    renderView();
    const aiChat = screen.getByRole("link", { name: /ai chat/i });
    const href = decodeURIComponent(aiChat.getAttribute("href") ?? "");
    expect(href).toContain('"sourceKind":"write_code_exercise"');
    expect(href).toContain('"sourceId":"dsa-two-sum-sorted"');
    expect(href).not.toContain("project_lab");
  });
});
