import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExerciseCatalogView } from "@/features/exercises/exercise-catalog-view";
import type { ExerciseView } from "@/features/exercises/exercise-view";
import { setExercise } from "@/features/exercises/exercise-actions";

vi.mock("@/features/exercises/exercise-actions", () => ({
  setExercise: vi.fn()
}));

const setExerciseMock = vi.mocked(setExercise);

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

afterEach(() => {
  vi.clearAllMocks();
});

describe("ExerciseCatalogView grouped accordion (#447)", () => {
  it("groups exercises under their primary skill with the four columns", () => {
    renderView();
    expect(screen.getByTestId("exercise-group-row")).toHaveTextContent("Two pointers");
    const table = screen.getByTestId("exercise-table");
    for (const col of ["Exercise", "Progress", "Start", "Complete"]) {
      expect(table).toHaveTextContent(col);
    }
    // No removed Status column / pills.
    expect(screen.queryByText(/In progress|Tests passed|Not started/i)).not.toBeInTheDocument();
  });

  it("shows the selected exercise in the detail panel with a Study link to /lab/<id>", () => {
    renderView();
    const detail = screen.getByTestId("exercise-detail");
    expect(detail).toHaveTextContent("Two pointers / DSA: two-sum on a sorted array");
    expect(detail).toHaveTextContent(/Description/i);
    expect(detail).toHaveTextContent(/Learning goals/i);

    const study = screen.getByTestId("exercise-study");
    const href = study.getAttribute("href") ?? "";
    expect(href).toBe("/lab/dsa-two-sum-sorted");
    expect(href).not.toContain("csv-table-summarizer");
  });

  it("does not show difficulty, Due, or tags in the detail panel", () => {
    renderView();
    const detail = screen.getByTestId("exercise-detail");
    expect(detail).not.toHaveTextContent(/intermediate/i);
    expect(detail).not.toHaveTextContent(/Due/i);
  });

  it("signed-out, starting an exercise surfaces the sign-in notice", async () => {
    setExerciseMock.mockResolvedValue({ status: "signed_out" });
    renderView();
    fireEvent.click(screen.getByTestId("exercise-start"));
    await waitFor(() => {
      expect(screen.getByTestId("exercise-notice")).toHaveTextContent(/sign in/i);
    });
    expect(setExerciseMock).toHaveBeenCalledWith(
      expect.objectContaining({ exerciseId: "dsa-two-sum-sorted", status: "started" })
    );
  });
});
