import { describe, expect, it } from "vitest";
import { buildLabPayload, fieldsFromLabPayload } from "@/features/user-content/lab-editor";
import { parseLabPayload } from "@/features/user-content/lab-content-schema";
import { CURRENT_LAB_SCHEMA_VERSION, LAB_EDITABLE_FILENAME, type LabPayload } from "@/features/user-content/lab-content-types";

describe("lab editor field mapping (#489)", () => {
  it("defaults an empty payload to a single-task / self_evaluation draft", () => {
    const fields = fieldsFromLabPayload(null);
    expect(fields.mode).toBe("single_task");
    expect(fields.evaluationMode).toBe("self_evaluation");
    expect(fields.milestones).toEqual([]);
    const payload = buildLabPayload(fields);
    expect(payload.mode).toBe("single_task");
    expect(payload.editableFilename).toBe(LAB_EDITABLE_FILENAME);
  });

  it("round-trips a single-task lab with run settings and a checklist", () => {
    const original: LabPayload = {
      schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
      title: "CSV summarizer",
      summary: "Summarize a CSV.",
      taskDescription: "Read a CSV and print per-column stats.",
      mode: "single_task",
      evaluationMode: "self_evaluation",
      difficulty: "intermediate",
      estimatedMinutes: 90,
      tags: ["io", "files"],
      starterCode: "int main(){}",
      referenceSolution: "int main(){ /* solve */ }",
      run: { cppStandard: "c++20", allowedLibraries: "standard_only", runtimeLimitMs: 5000, memoryLimitMb: 256 },
      completion: { selfChecklist: ["compiles", "handles empty input"] }
    };
    const rebuilt = parseLabPayload(buildLabPayload(fieldsFromLabPayload(original)));
    expect(rebuilt.ok).toBe(true);
    if (rebuilt.ok) {
      expect(rebuilt.value.title).toBe("CSV summarizer");
      expect(rebuilt.value.tags).toEqual(["io", "files"]);
      expect(rebuilt.value.estimatedMinutes).toBe(90);
      expect(rebuilt.value.run?.cppStandard).toBe("c++20");
      expect(rebuilt.value.run?.runtimeLimitMs).toBe(5000);
      expect(rebuilt.value.completion?.selfChecklist).toEqual(["compiles", "handles empty input"]);
      expect(rebuilt.value.milestones).toBeUndefined();
    }
  });

  it("round-trips a milestone lab preserving order, required flags, and per-milestone tests", () => {
    const original: LabPayload = {
      schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
      title: "Build a shell",
      summary: "A tiny shell.",
      taskDescription: "Implement a minimal shell.",
      mode: "milestones",
      evaluationMode: "automated_tests",
      milestones: [
        { id: "m1", title: "Read a line", instructions: "Read input.", required: true, tests: [{ name: "t1", input: "hi\n", expectedOutput: "hi\n", hidden: false }] },
        { id: "m2", title: "Run a command", instructions: "Exec it.", objective: "process control", required: false, tests: [{ name: "t2", input: "", expectedOutput: "ok\n", hidden: true }] }
      ]
    };
    const rebuilt = parseLabPayload(buildLabPayload(fieldsFromLabPayload(original)));
    expect(rebuilt.ok).toBe(true);
    if (rebuilt.ok) {
      expect(rebuilt.value.milestones).toHaveLength(2);
      expect(rebuilt.value.milestones?.[0].id).toBe("m1");
      expect(rebuilt.value.milestones?.[0].required).toBe(true);
      expect(rebuilt.value.milestones?.[0].tests?.[0].name).toBe("t1");
      expect(rebuilt.value.milestones?.[1].required).toBe(false);
      expect(rebuilt.value.milestones?.[1].objective).toBe("process control");
      expect(rebuilt.value.milestones?.[1].tests?.[0].hidden).toBe(true);
      // single-task completion is dropped in milestone mode
      expect(rebuilt.value.completion).toBeUndefined();
    }
  });

  it("round-trips single-task completion tests", () => {
    const original: LabPayload = {
      schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
      title: "Echo",
      summary: "Echo input.",
      taskDescription: "Read and echo.",
      mode: "single_task",
      evaluationMode: "automated_tests",
      completion: { tests: [{ name: "basic", input: "hi\n", expectedOutput: "hi\n", hidden: false }] }
    };
    const rebuilt = parseLabPayload(buildLabPayload(fieldsFromLabPayload(original)));
    expect(rebuilt.ok).toBe(true);
    if (rebuilt.ok) {
      expect(rebuilt.value.completion?.tests).toHaveLength(1);
      expect(rebuilt.value.completion?.tests?.[0].name).toBe("basic");
    }
  });

  it("omits empty run config and does not emit fixtures without a filename", () => {
    const fields = fieldsFromLabPayload(null);
    fields.title = "T";
    fields.summary = "S";
    fields.taskDescription = "D";
    fields.fixtures = [{ filename: "", content: "orphan" }];
    const payload = buildLabPayload(fields);
    expect(payload.run).toBeUndefined();
    expect(payload.fixtures).toBeUndefined();
  });
});
