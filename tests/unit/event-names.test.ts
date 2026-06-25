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

function readRepoFile(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), "utf8");
}

/** Single-quoted lowercase identifiers, e.g. the event names in a SQL allowlist. */
function singleQuotedIdents(sql: string): string[] {
  return [...sql.matchAll(/'([a-z_][a-z0-9_]*)'/g)].map((m) => m[1]);
}

// The DB constraint and the #441 preflight/smoke guards hardcode the allowlist in
// SQL (SQL cannot import the TS list). These tests fail if either drifts from
// SKILL_EVENT_NAMES so the contract stays in lockstep.
const FINAL_CONSTRAINT_MIGRATION =
  "supabase/migrations/20260618170000_add_placement_event_names.sql";
const PREFLIGHT_MIGRATION =
  "supabase/migrations/20260625120000_preflight_skill_event_type_integrity.sql";

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

  it("final DB constraint allowlist matches SKILL_EVENT_NAMES exactly (#441)", () => {
    const sqlNames = singleQuotedIdents(readRepoFile(FINAL_CONSTRAINT_MIGRATION));
    expect([...new Set(sqlNames)].sort()).toEqual([...SKILL_EVENT_NAMES].sort());
  });

  it("preflight integrity migration covers every stable name (#441)", () => {
    const sql = readRepoFile(PREFLIGHT_MIGRATION);
    const present = new Set(singleQuotedIdents(sql));
    for (const name of SKILL_EVENT_NAMES) {
      expect(present.has(name)).toBe(true);
    }
  });

  it("smoke integrity guard covers every stable name (#441)", () => {
    const sql = readRepoFile("scripts/ci/smoke.sql");
    const present = new Set(singleQuotedIdents(sql));
    for (const name of SKILL_EVENT_NAMES) {
      expect(present.has(name)).toBe(true);
    }
  });
});
