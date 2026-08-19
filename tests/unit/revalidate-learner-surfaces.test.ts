import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

import {
  learnerSurfacePaths,
  revalidateLearnerSurfaces
} from "@/features/learning/revalidate-learner-surfaces";

describe("learner surface invalidation", () => {
  beforeEach(() => revalidatePath.mockReset());

  it("owns the dashboard, goals, review, and optional goal detail paths", () => {
    expect(learnerSurfacePaths()).toEqual(["/dashboard", "/goals", "/review"]);
    expect(learnerSurfacePaths("goal id")).toEqual([
      "/dashboard",
      "/goals",
      "/goals/goal%20id",
      "/review"
    ]);

    revalidateLearnerSurfaces("goal id");
    expect(revalidatePath.mock.calls).toEqual([
      ...learnerSurfacePaths("goal id").map((path) => [path]),
      ["/goals/[goalId]", "page"]
    ]);
  });
});
