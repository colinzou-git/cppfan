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
