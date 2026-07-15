import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExerciseCatalogView } from "@/features/exercises/exercise-catalog-view";
import type { ExerciseView } from "@/features/exercises/exercise-view";
import type { ExerciseProgress } from "@/features/exercises/exercise-progress";
import { startExercise } from "@/features/exercises/exercise-actions";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

vi.mock("@/features/exercises/exercise-actions", () => ({
  startExercise: vi.fn()
}));

const startExerciseMock = vi.mocked(startExercise);

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

function renderView(initialProgress: ExerciseProgress[] = [], authenticated = false) {
  return render(
    <ExerciseCatalogView exercises={[exercise]} initialProgress={initialProgress} authenticated={authenticated} />
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("ExerciseCatalogView dates + Study start (#447, #472)", () => {
  it("keeps the four columns and renders date cells, not Start/Complete buttons", () => {
    renderView([
      {
        exercise_id: "dsa-two-sum-sorted",
        status: "completed",
        reflection: null,
        started_at: "2026-06-24T10:00:00Z",
        completed_at: "2026-06-25T12:00:00Z"
      }
    ]);
    const table = screen.getByTestId("exercise-table");
    for (const col of ["Exercise", "Progress", "Start", "Complete"]) {
      expect(table).toHaveTextContent(col);
    }
    // Dates render in the row.
    expect(screen.getByTestId("exercise-start-date").textContent).toBe("2026-06-24");
    expect(screen.getByTestId("exercise-complete-date").textContent).toBe("2026-06-25");
    // No inline Start/Complete action buttons remain.
    expect(screen.queryByRole("button", { name: /^Start$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Complete$/ })).not.toBeInTheDocument();
  });

  it("shows em dashes for a never-started exercise", () => {
    renderView();
    expect(screen.getByTestId("exercise-start-date").textContent).toBe("—");
    expect(screen.getByTestId("exercise-complete-date").textContent).toBe("—");
  });

  it("clicking Study records the start and navigates to /lab/<id>", async () => {
    startExerciseMock.mockResolvedValue({ status: "ok" });
    renderView();

    fireEvent.click(screen.getByTestId("exercise-study"));

    expect(pushMock).toHaveBeenCalledWith("/lab/dsa-two-sum-sorted");
    await waitFor(() => {
      expect(startExerciseMock).toHaveBeenCalledWith({ exerciseId: "dsa-two-sum-sorted" });
    });
  });

  it("navigates even when signed out (start save fails)", async () => {
    startExerciseMock.mockResolvedValue({ status: "signed_out" });
    renderView([], false);

    fireEvent.click(screen.getByTestId("exercise-study"));
    expect(pushMock).toHaveBeenCalledWith("/lab/dsa-two-sum-sorted");
    expect(screen.getByTestId("exercise-signed-out-note")).toBeInTheDocument();
  });

  it("Study targets the selected exercise", () => {
    renderView();
    expect(screen.getByTestId("exercise-study")).toHaveAttribute("data-exercise-id", "dsa-two-sum-sorted");
  });

  it("shows no source filter for a native-only catalog (#488)", () => {
    renderView();
    expect(screen.queryByTestId("exercise-source-filter")).toBeNull();
  });

  it("shows a source filter and filters groups when user exercises are present (#488)", () => {
    const userExercise: ExerciseView = {
      ...exercise,
      id: "user.item.c1",
      title: "My reverse exercise",
      skillTitles: ["strings"],
      source: "user"
    };
    render(<ExerciseCatalogView exercises={[exercise, userExercise]} initialProgress={[]} authenticated />);

    expect(screen.getByTestId("exercise-source-filter")).toBeInTheDocument();
    expect(screen.getAllByText("User-Created").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Native cppFan").length).toBeGreaterThan(0);

    // filtering to User-Created hides the native "Two pointers" group
    fireEvent.click(screen.getByRole("button", { name: "User-Created" }));
    expect(screen.queryByText("Two pointers")).toBeNull();
    expect(screen.getByText("Your exercises")).toBeInTheDocument();
  });
});
