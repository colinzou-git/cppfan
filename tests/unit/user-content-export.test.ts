import { describe, expect, it } from "vitest";
import { EXPORT_SCHEMA_VERSION, buildLessonMarkdown, buildUserContentExport } from "@/features/user-content/user-content-export";
import { CURRENT_LESSON_SCHEMA_VERSION, type LessonPayload } from "@/features/user-content/user-content-types";

function lesson(overrides: Partial<LessonPayload> = {}): LessonPayload {
  return {
    schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
    itemType: "lesson",
    title: "Pointers",
    content: "A pointer holds an address.",
    explanation: "Addresses let you refer to memory.",
    ...overrides
  };
}

describe("buildLessonMarkdown (#487)", () => {
  it("renders the core fields as Markdown", () => {
    const md = buildLessonMarkdown(lesson({ difficulty: "beginner", estimatedMinutes: 12 }));
    expect(md).toContain("# Pointers");
    expect(md).toContain("Type: lesson");
    expect(md).toContain("beginner");
    expect(md).toContain("~12 min");
    expect(md).toContain("A pointer holds an address.");
    expect(md).toContain("## Explanation");
  });

  it("includes objectives, sections, examples, and code when present", () => {
    const md = buildLessonMarkdown(
      lesson({
        learningObjectives: ["Understand addresses"],
        sections: { commonMistakes: "Dereferencing null" },
        examples: [{ input: "1", output: "2", note: "increment" }],
        sampleCode: "int* p = &x;"
      })
    );
    expect(md).toContain("## Learning objectives");
    expect(md).toContain("- Understand addresses");
    expect(md).toContain("### Common mistakes");
    expect(md).toContain("Dereferencing null");
    expect(md).toContain("## Input / output examples");
    expect(md).toContain("increment");
    expect(md).toContain("## Sample code");
    expect(md).toContain("int* p = &x;");
  });
});

describe("buildUserContentExport (#487)", () => {
  const meta = {
    id: "c1",
    kind: "lesson" as const,
    title: "Pointers",
    lifecycleStatus: "published" as const,
    nativeModuleId: null,
    draftRevision: 3,
    updatedAt: "2026-01-02T00:00:00Z",
    publishedAt: "2026-01-02T00:00:00Z"
  };

  it("assembles a schema-versioned manifest and prefers the published payload for Markdown", () => {
    const result = buildUserContentExport(
      meta,
      lesson({ title: "Draft title" }),
      lesson({ title: "Published title" }),
      new Date("2026-01-03T00:00:00Z")
    );
    expect(result.exportSchemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(result.exportedAt).toBe("2026-01-03T00:00:00.000Z");
    expect(result.item.id).toBe("c1");
    expect(result.draftPayload?.title).toBe("Draft title");
    expect(result.publishedPayload?.title).toBe("Published title");
    expect(result.markdown).toContain("# Published title");
  });

  it("falls back to the draft payload when nothing is published", () => {
    const result = buildUserContentExport({ ...meta, lifecycleStatus: "draft", publishedAt: null }, lesson({ title: "Only draft" }), null);
    expect(result.markdown).toContain("# Only draft");
  });

  it("produces empty Markdown when there is no payload at all", () => {
    const result = buildUserContentExport(meta, null, null);
    expect(result.markdown).toBe("");
  });
});

import {
  CURRENT_EXERCISE_SCHEMA_VERSION,
  type ExercisePayload
} from "@/features/user-content/exercise-content-types";
import {
  buildExerciseContentExport,
  buildExerciseMarkdown
} from "@/features/user-content/user-content-export";

function exercise(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse a line",
    prompt: "Read a line and print it reversed.",
    mode: "stdin_program",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

describe("buildExerciseMarkdown (#488)", () => {
  it("renders prompt, code, and tests", () => {
    const md = buildExerciseMarkdown(
      exercise({
        starterCode: "int main(){}",
        referenceSolution: "int main(){ /* solve */ }",
        stdinFormat: "one line",
        stdoutFormat: "the reversed line",
        tests: [
          { name: "basic", input: "ab\n", expectedOutput: "ba\n", hidden: false },
          { name: "edge", input: "\n", expectedOutput: "\n", hidden: true }
        ]
      })
    );
    expect(md).toContain("# Reverse a line");
    expect(md).toContain("## Prompt");
    expect(md).toContain("## Starter code");
    expect(md).toContain("## Reference solution");
    expect(md).toContain("basic");
    expect(md).toContain("(hidden)");
  });

  it("renders the function signature in function mode", () => {
    const md = buildExerciseMarkdown(exercise({ mode: "function", functionSignature: "int add(int,int)" }));
    expect(md).toContain("## Function signature");
    expect(md).toContain("int add(int,int)");
  });
});

describe("buildExerciseContentExport (#488)", () => {
  it("wraps the exercise with a schema-versioned manifest + markdown", () => {
    const data = buildExerciseContentExport(
      {
        id: "e1",
        kind: "exercise",
        title: "Reverse",
        lifecycleStatus: "published",
        nativeModuleId: null,
        draftRevision: 1,
        updatedAt: "2026-07-15T00:00:00Z",
        publishedAt: "2026-07-15T00:00:00Z"
      },
      null,
      exercise(),
      new Date("2026-07-15T00:00:00Z")
    );
    expect(data.exportSchemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(data.item.kind).toBe("exercise");
    expect(data.markdown).toContain("Reverse a line");
    expect(data.publishedPayload).not.toBeNull();
  });
});

import {
  CURRENT_LAB_SCHEMA_VERSION,
  type LabPayload
} from "@/features/user-content/lab-content-types";
import {
  buildLabContentExport,
  buildLabMarkdown
} from "@/features/user-content/user-content-export";

function lab(overrides: Partial<LabPayload> = {}): LabPayload {
  return {
    schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
    title: "CSV summarizer",
    summary: "Summarize a CSV.",
    taskDescription: "Read a CSV and print per-column stats.",
    mode: "single_task",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("buildLabMarkdown (#489)", () => {
  it("renders summary, task, code, and milestones", () => {
    const md = buildLabMarkdown(
      lab({
        mode: "milestones",
        starterCode: "int main(){}",
        referenceSolution: "int main(){ /* solve */ }",
        milestones: [
          { id: "m1", title: "Parse", instructions: "Parse the CSV.", required: true },
          { id: "m2", title: "Stats", instructions: "Compute stats.", required: false }
        ]
      })
    );
    expect(md).toContain("# CSV summarizer");
    expect(md).toContain("## Task");
    expect(md).toContain("## Starter code");
    expect(md).toContain("## Milestones");
    expect(md).toContain("Parse");
    expect(md).toContain("(optional)");
  });
});

describe("buildLabContentExport (#489)", () => {
  it("wraps the lab with a schema-versioned manifest + markdown", () => {
    const data = buildLabContentExport(
      {
        id: "l1",
        kind: "lab",
        title: "CSV",
        lifecycleStatus: "published",
        nativeModuleId: null,
        draftRevision: 1,
        updatedAt: "2026-07-16T00:00:00Z",
        publishedAt: "2026-07-16T00:00:00Z"
      },
      null,
      lab(),
      new Date("2026-07-16T00:00:00Z")
    );
    expect(data.exportSchemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(data.item.kind).toBe("lab");
    expect(data.markdown).toContain("CSV summarizer");
    expect(data.publishedPayload).not.toBeNull();
  });
});
