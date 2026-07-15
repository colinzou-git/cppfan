import { describe, expect, it } from "vitest";
import { parseLabPayload, validateLabForPublication } from "@/features/user-content/lab-content-schema";
import { CURRENT_LAB_SCHEMA_VERSION, LAB_EDITABLE_FILENAME } from "@/features/user-content/lab-content-types";

function base(overrides: Record<string, unknown> = {}) {
  return {
    title: "CSV summarizer",
    summary: "Build a small CSV table summarizer.",
    taskDescription: "Read a CSV from stdin and print per-column stats.",
    ...overrides
  };
}

describe("parseLabPayload (#489)", () => {
  it("accepts a minimal single-task lab with defaults", () => {
    const result = parseLabPayload(base());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("single_task");
      expect(result.value.evaluationMode).toBe("self_evaluation");
      expect(result.value.editableFilename).toBe(LAB_EDITABLE_FILENAME);
      expect(result.value.schemaVersion).toBe(CURRENT_LAB_SCHEMA_VERSION);
    }
  });

  it("rejects a payload missing required fields", () => {
    expect(parseLabPayload({ summary: "s", taskDescription: "t" }).ok).toBe(false);
    expect(parseLabPayload({ title: "t", taskDescription: "t" }).ok).toBe(false);
    expect(parseLabPayload({ title: "t", summary: "s" }).ok).toBe(false);
    expect(parseLabPayload("nope").ok).toBe(false);
  });

  it("rejects a future schema version", () => {
    expect(parseLabPayload(base({ schemaVersion: 99 })).ok).toBe(false);
  });

  it("rejects raw build/run shell commands but keeps structured settings", () => {
    const bad = parseLabPayload(base({ run: { buildCommand: "rm -rf /", cppStandard: "c++20" } }));
    expect(bad.ok).toBe(false);
    const good = parseLabPayload(
      base({ run: { cppStandard: "c++20", allowedLibraries: "standard_only", runtimeLimitMs: 5000, memoryLimitMb: 256 } })
    );
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.value.run?.cppStandard).toBe("c++20");
      expect(good.value.run?.allowedLibraries).toBe("standard_only");
      expect(good.value.run?.runtimeLimitMs).toBe(5000);
    }
  });

  it("rejects fixtures with path traversal or the editable filename, dedupes", () => {
    const result = parseLabPayload(
      base({
        fixtures: [
          { filename: "input.txt", content: "a" },
          { filename: "../secret", content: "b" },
          { filename: LAB_EDITABLE_FILENAME, content: "c" },
          { filename: "input.txt", content: "dupe" }
        ]
      })
    );
    expect(result.ok).toBe(false); // traversal + editable-name + dupe raise issues
  });

  it("parses ordered milestones with a stable id and required flag", () => {
    const result = parseLabPayload(
      base({
        mode: "milestones",
        milestones: [
          { title: "Parse", instructions: "Parse the CSV.", required: true },
          { title: "Summarize", instructions: "Compute stats.", tests: [{ name: "t", input: "", expectedOutput: "", hidden: true }] }
        ]
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.milestones).toHaveLength(2);
      expect(result.value.milestones?.[0].id).toBe("m1");
      expect(result.value.milestones?.[0].required).toBe(true);
      expect(result.value.milestones?.[1].required).toBe(true); // default
      expect(result.value.milestones?.[1].tests?.[0].hidden).toBe(true);
    }
  });

  it("parses a completion contract with assertions", () => {
    const result = parseLabPayload(
      base({
        completion: {
          assertions: [
            { kind: "stdout_contains", value: "OK" },
            { kind: "file_exists", target: "out.txt", value: "" }
          ],
          selfChecklist: ["compiles", "handles empty input"]
        }
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.completion?.assertions).toHaveLength(2);
      expect(result.value.completion?.selfChecklist).toHaveLength(2);
    }
  });

  it("rejects a file assertion with no target", () => {
    const result = parseLabPayload(base({ completion: { assertions: [{ kind: "file_contains", value: "x" }] } }));
    expect(result.ok).toBe(false);
  });
});

describe("validateLabForPublication (#489)", () => {
  it("passes a self-evaluated single-task lab with no tests", () => {
    const parsed = parseLabPayload(base());
    expect(parsed.ok && validateLabForPublication(parsed.value)).toEqual([]);
  });

  it("requires at least one milestone in milestone mode", () => {
    const parsed = parseLabPayload(base({ mode: "milestones" }));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const issues = validateLabForPublication(parsed.value);
      expect(issues.some((i) => i.field === "milestones")).toBe(true);
    }
  });

  it("requires a test for automated evaluation", () => {
    const parsed = parseLabPayload(base({ evaluationMode: "automated_tests" }));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const issues = validateLabForPublication(parsed.value);
      expect(issues.some((i) => i.field === "tests")).toBe(true);
    }
  });

  it("accepts automated evaluation when a milestone carries a test", () => {
    const parsed = parseLabPayload(
      base({
        mode: "milestones",
        evaluationMode: "automated_tests",
        milestones: [{ title: "M", instructions: "do it", required: true, tests: [{ name: "t", input: "", expectedOutput: "1", hidden: false }] }]
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(validateLabForPublication(parsed.value)).toEqual([]);
    }
  });

  it("requires at least one required milestone", () => {
    const parsed = parseLabPayload(
      base({
        mode: "milestones",
        milestones: [{ title: "Optional", instructions: "maybe", required: false }]
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const issues = validateLabForPublication(parsed.value);
      expect(issues.some((i) => i.message.includes("required"))).toBe(true);
    }
  });
});
