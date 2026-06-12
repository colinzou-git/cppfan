import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SKILL_EVENT_NAMES, isSkillEventName } from "@/features/events/event-names";

/**
 * Parse the bullet list of event names out of the source-of-truth doc so the
 * code list can never silently drift from it.
 */
function eventNamesFromDoc(): string[] {
  const doc = readFileSync(resolve(process.cwd(), "docs/EVENT_SCHEMA_STABLE_NAMES.md"), "utf8");
  const start = doc.indexOf("Use these event names in code:");
  const end = doc.indexOf("Common fields:");
  const section = doc.slice(start, end === -1 ? undefined : end);
  return section
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => line.trim().slice(2).trim());
}

describe("stable skill event names", () => {
  it("matches docs/EVENT_SCHEMA_STABLE_NAMES.md exactly", () => {
    expect([...SKILL_EVENT_NAMES].sort()).toEqual(eventNamesFromDoc().sort());
  });

  it("has no duplicates", () => {
    expect(new Set(SKILL_EVENT_NAMES).size).toBe(SKILL_EVENT_NAMES.length);
  });

  it("recognizes known names and rejects unknown ones", () => {
    expect(isSkillEventName("quiz_correct")).toBe(true);
    expect(isSkillEventName("not_an_event")).toBe(false);
  });
});
