import { describe, expect, it } from "vitest";
import { activeLabContract, labMilestoneViews, labPayloadToCodeLabConfig, labPrompt } from "@/features/user-content/lab-code-lab";
import { CURRENT_LAB_SCHEMA_VERSION, type LabPayload } from "@/features/user-content/lab-content-types";

function lab(overrides: Partial<LabPayload> = {}): LabPayload {
  return {
    schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
    title: "CSV",
    summary: "Summarize a CSV.",
    taskDescription: "Read a CSV and print stats.",
    mode: "single_task",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

describe("labPayloadToCodeLabConfig (#489)", () => {
  it("builds a single-task config with visible tests only + a hidden count", () => {
    const config = labPayloadToCodeLabConfig(
      lab({
        starterCode: "int main(){}",
        completion: {
          tests: [
            { name: "v", input: "a\n", expectedOutput: "1\n", hidden: false },
            { name: "h", input: "b\n", expectedOutput: "2\n", hidden: true }
          ]
        }
      })
    );
    expect(config.starterCode).toBe("int main(){}");
    expect(config.visibleTests).toHaveLength(1);
    expect(config.visibleTests[0].name).toBe("v");
    expect(config.hiddenTestCount).toBe(1);
    // hidden I/O never leaks into the client config
    expect(JSON.stringify(config)).not.toContain("2\\n");
  });

  it("uses the first milestone's contract in milestone mode (no later criteria)", () => {
    const config = labPayloadToCodeLabConfig(
      lab({
        mode: "milestones",
        milestones: [
          { id: "m1", title: "Parse", instructions: "Parse it.", required: true, tests: [{ name: "m1v", input: "", expectedOutput: "ok\n", hidden: false }] },
          { id: "m2", title: "Later", instructions: "Later.", required: true, tests: [{ name: "SECRET", input: "", expectedOutput: "z\n", hidden: false }] }
        ]
      })
    );
    expect(config.visibleTests.map((t) => t.name)).toEqual(["m1v"]);
    // milestone 2's criteria never appear
    expect(JSON.stringify(config)).not.toContain("SECRET");
    expect(config.prompt).toContain("Milestone 1: Parse");
  });

  it("activeLabContract clamps an out-of-range milestone index", () => {
    const payload = lab({
      mode: "milestones",
      milestones: [{ id: "m1", title: "A", instructions: "a", required: true }]
    });
    expect(activeLabContract(payload, 5)).toBe(payload.milestones?.[0]);
    expect(activeLabContract(payload, -3)).toBe(payload.milestones?.[0]);
  });

  it("labPrompt falls back to the task description for a single-task lab", () => {
    expect(labPrompt(lab())).toBe("Read a CSV and print stats.");
  });
});

describe("labMilestoneViews (#489)", () => {
  it("returns a single Task view for a single-task lab", () => {
    const views = labMilestoneViews(lab({ starterCode: "int main(){}" }));
    expect(views).toHaveLength(1);
    expect(views[0].label).toBe("Task");
    expect(views[0].required).toBe(true);
    expect(views[0].config.starterCode).toBe("int main(){}");
  });

  it("returns one view per milestone with no later hidden criteria leaking", () => {
    const views = labMilestoneViews(
      lab({
        mode: "milestones",
        milestones: [
          { id: "m1", title: "Parse", instructions: "p", required: true, tests: [{ name: "m1v", input: "", expectedOutput: "ok\n", hidden: false }] },
          { id: "m2", title: "Stats", instructions: "s", required: false, tests: [{ name: "SECRET", input: "", expectedOutput: "z\n", hidden: false }] }
        ]
      })
    );
    expect(views.map((v) => v.label)).toEqual(["Parse", "Stats"]);
    expect(views[0].index).toBe(0);
    expect(views[1].required).toBe(false);
    // milestone 0's view must not carry milestone 1's tests
    expect(JSON.stringify(views[0].config)).not.toContain("SECRET");
  });
});
