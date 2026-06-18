import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";
import {
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";

// #97: compare the actual migrated database state with the TypeScript seed.
// This intentionally queries Postgres after migrations instead of parsing SQL.

const ready = Boolean(process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER);
const suite = ready ? describe : describe.skip;

type Row = Record<string, unknown>;

function psqlJson<T>(sql: string): T[] {
  const output = execFileSync(
    "psql",
    ["-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", sql],
    { encoding: "utf8" }
  ).trim();
  return JSON.parse(output || "[]") as T[];
}

function sortRows<T extends Row>(rows: T[], keys: (keyof T)[]): T[] {
  return [...rows].sort((a, b) => {
    for (const key of keys) {
      const left = String(a[key] ?? "");
      const right = String(b[key] ?? "");
      if (left !== right) return left.localeCompare(right);
    }
    return 0;
  });
}

function parityDiff<T extends Row>(seedRows: T[], dbRows: T[], keyFields: (keyof T)[]): string[] {
  const keyOf = (row: T) => keyFields.map((key) => String(row[key])).join("::");
  const seedByKey = new Map(seedRows.map((row) => [keyOf(row), row]));
  const dbByKey = new Map(dbRows.map((row) => [keyOf(row), row]));
  const diffs: string[] = [];

  for (const key of seedByKey.keys()) {
    if (!dbByKey.has(key)) diffs.push(`missing in database: ${key}`);
  }
  for (const key of dbByKey.keys()) {
    if (!seedByKey.has(key)) diffs.push(`extra in database: ${key}`);
  }

  for (const [key, seedRow] of seedByKey) {
    const dbRow = dbByKey.get(key);
    if (!dbRow) continue;
    for (const field of Object.keys(seedRow)) {
      const seedValue = seedRow[field];
      const dbValue = dbRow[field];
      if (JSON.stringify(seedValue) !== JSON.stringify(dbValue)) {
        diffs.push(`${key}.${field}: seed=${JSON.stringify(seedValue)} db=${JSON.stringify(dbValue)}`);
      }
    }
  }

  return diffs.slice(0, 50);
}

function expectParity<T extends Row>(name: string, seedRows: T[], dbRows: T[], keyFields: (keyof T)[]) {
  const diffs = parityDiff(sortRows(seedRows, keyFields), sortRows(dbRows, keyFields), keyFields);
  expect(diffs, `${name} parity drift:\n${diffs.join("\n")}`).toEqual([]);
}

suite("database <-> TypeScript curriculum parity (#97)", () => {
  it("matches skills and structural metadata", () => {
    const seedRows = skillSeed.map((skill) => ({
      id: skill.id,
      domain: skill.domain,
      module_id: skill.module_id,
      title: skill.title,
      level: skill.level,
      item_types: skill.item_types,
      order_index: skill.order_index,
      is_active: skill.is_active
    }));
    const dbRows = psqlJson<typeof seedRows[number]>(`
      select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb)::text
      from (
        select id, domain, module_id, title, level,
               to_jsonb(item_types) as item_types, order_index, is_active
        from public.skills
      ) t;
    `);
    expectParity("skills", seedRows, dbRows, ["id"]);
  });

  it("matches prerequisite edges", () => {
    const seedRows = skillPrerequisitesSeed.map((edge) => ({
      skill_id: edge.skill_id,
      prerequisite_skill_id: edge.prerequisite_skill_id,
      relationship_type: edge.relationship_type
    }));
    const dbRows = psqlJson<typeof seedRows[number]>(`
      select coalesce(jsonb_agg(to_jsonb(t) order by skill_id, prerequisite_skill_id), '[]'::jsonb)::text
      from (
        select skill_id, prerequisite_skill_id, relationship_type
        from public.skill_prerequisites
      ) t;
    `);
    expectParity("skill_prerequisites", seedRows, dbRows, ["skill_id", "prerequisite_skill_id"]);
  });

  it("matches learning item structural metadata", () => {
    const seedRows = learningItems.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      difficulty: item.difficulty,
      estimated_minutes: item.estimated_minutes,
      order_index: item.order_index,
      is_active: item.is_active
    }));
    const dbRows = psqlJson<typeof seedRows[number]>(`
      select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb)::text
      from (
        select id, type, title, difficulty,
               estimated_minutes, order_index, is_active
        from public.learning_items
      ) t;
    `);
    expectParity("learning_items", seedRows, dbRows, ["id"]);
  });

  it("matches item-skill mappings", () => {
    const seedRows = learningItemSkills.map((mapping) => ({
      learning_item_id: mapping.learning_item_id,
      skill_id: mapping.skill_id,
      is_primary: mapping.is_primary
    }));
    const dbRows = psqlJson<typeof seedRows[number]>(`
      select coalesce(jsonb_agg(to_jsonb(t) order by learning_item_id, skill_id), '[]'::jsonb)::text
      from (
        select learning_item_id, skill_id, is_primary
        from public.learning_item_skills
      ) t;
    `);
    expectParity("learning_item_skills", seedRows, dbRows, ["learning_item_id", "skill_id"]);
  });

  it("matches choice sets, order, and answer keys", () => {
    const seedRows = learningItemChoices.map((choice) => ({
      id: choice.id,
      learning_item_id: choice.learning_item_id,
      is_correct: Boolean(choice.is_correct),
      order_index: choice.order_index
    }));
    const dbRows = psqlJson<typeof seedRows[number]>(`
      select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]'::jsonb)::text
      from (
        select id, learning_item_id, is_correct, order_index
        from public.learning_item_choices
      ) t;
    `);
    expectParity("learning_item_choices", seedRows, dbRows, ["id"]);
  });
});
