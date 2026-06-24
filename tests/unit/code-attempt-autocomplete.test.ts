import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { recordCodeAttempt } from "@/features/code-lab/code-attempt-service";
import { setExerciseProgress } from "@/features/exercises/exercise-progress";
import type { CodeTestResult } from "@/features/code-lab/code-lab-types";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/features/events/event-service", () => ({ recordSkillEvents: vi.fn().mockResolvedValue(true) }));
vi.mock("@/features/exercises/exercise-progress", () => ({ setExerciseProgress: vi.fn().mockResolvedValue("ok") }));

function signedInClient() {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })
  };
}

const passingTest: CodeTestResult = {
  status: "ok",
  simulated: false,
  total: 2,
  passed: 2,
  provider: "piston"
} as unknown as CodeTestResult;

const failingTest: CodeTestResult = {
  status: "ok",
  simulated: false,
  total: 2,
  passed: 1,
  provider: "piston"
} as unknown as CodeTestResult;

const simulatedTest: CodeTestResult = {
  status: "ok",
  simulated: true,
  total: 2,
  passed: 2,
  provider: "mock"
} as unknown as CodeTestResult;

describe("recordCodeAttempt auto-completes write-code exercises (#440)", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    vi.mocked(setExerciseProgress).mockClear();
    vi.mocked(createClient).mockResolvedValue(signedInClient() as never);
  });

  it("marks a known exercise complete on a passing real test, without re-recording events", async () => {
    await recordCodeAttempt({ itemId: "dsa-two-sum-sorted", source: "x", test: passingTest });
    expect(setExerciseProgress).toHaveBeenCalledWith({
      exerciseId: "dsa-two-sum-sorted",
      status: "completed",
      recordEvents: false
    });
  });

  it("does not auto-complete when not all tests pass", async () => {
    await recordCodeAttempt({ itemId: "dsa-two-sum-sorted", source: "x", test: failingTest });
    expect(setExerciseProgress).not.toHaveBeenCalled();
  });

  it("does not auto-complete a simulated (mock) test attempt", async () => {
    await recordCodeAttempt({ itemId: "dsa-two-sum-sorted", source: "x", test: simulatedTest });
    expect(setExerciseProgress).not.toHaveBeenCalled();
  });

  it("does not auto-complete an unknown item id (e.g. a project lab)", async () => {
    await recordCodeAttempt({ itemId: "csv-table-summarizer", source: "x", test: passingTest });
    expect(setExerciseProgress).not.toHaveBeenCalled();
  });
});
