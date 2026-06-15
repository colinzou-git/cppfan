import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getLearningItemById } from "@/features/learning-items/learning-item-seed";

// #98: structural validation of the executable curriculum examples. The actual
// compilation/output check runs in CI via scripts/curriculum-examples/verify.mjs;
// here we guard the manifest contract so a malformed example fails fast and cheap.

const EXAMPLES_DIR = join(process.cwd(), "curriculum-examples");
const VALID_KINDS = new Set(["positive", "bug_spotting"]);
const VALID_STANDARDS = new Set(["c++17", "c++20", "c++23"]);

type ExampleMeta = {
  itemId: string;
  kind: string;
  standard: string;
  expectedOutput?: string;
  defect?: string;
  correctedBy?: string;
};

const ids = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

function readMeta(id: string): ExampleMeta {
  return JSON.parse(readFileSync(join(EXAMPLES_DIR, id, "meta.json"), "utf8")) as ExampleMeta;
}

describe("curriculum executable examples (#98)", () => {
  it("has at least one positive and one bug-spotting example", () => {
    const kinds = ids.map((id) => readMeta(id).kind);
    expect(kinds).toContain("positive");
    expect(kinds).toContain("bug_spotting");
  });

  for (const id of ids) {
    it(`${id} has a well-formed manifest and source tied to a real learning item`, () => {
      const meta = readMeta(id);

      // Every example references an existing seeded learning item.
      expect(getLearningItemById(meta.itemId), `${id}: unknown itemId ${meta.itemId}`).not.toBeNull();
      expect(VALID_KINDS.has(meta.kind), `${id}: bad kind ${meta.kind}`).toBe(true);
      expect(VALID_STANDARDS.has(meta.standard), `${id}: bad standard ${meta.standard}`).toBe(true);
      expect(existsSync(join(EXAMPLES_DIR, id, "example.cpp")), `${id}: missing example.cpp`).toBe(true);

      if (meta.kind === "positive") {
        // A positive example may declare an output contract; if so it is non-empty.
        if (meta.expectedOutput !== undefined) {
          expect(meta.expectedOutput.length).toBeGreaterThan(0);
        }
      } else {
        // A bug-spotting example documents its defect and, if it names a corrected
        // companion, that companion exists and is positive.
        expect((meta.defect ?? "").length, `${id}: bug_spotting needs a defect note`).toBeGreaterThan(0);
        if (meta.correctedBy) {
          expect(ids, `${id}: correctedBy ${meta.correctedBy} not found`).toContain(meta.correctedBy);
          expect(readMeta(meta.correctedBy).kind).toBe("positive");
        }
      }
    });
  }
});
