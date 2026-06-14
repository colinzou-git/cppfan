import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// #97: SQL <-> TypeScript seed parity. The curriculum is authored in lockstep —
// every id in the TypeScript seed must also exist as a literal in some idempotent
// migration, so the bundled fallback can never drift from the database schema.
// This is the forward (seed -> migration) drift guard; the prerequisite-graph
// half lives in skill-map-integrity.test.ts. A bounded membership check (no SQL
// parsing) keeps it robust and false-positive-free.

const ROOT = process.cwd();
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

/**
 * Dotted ids declared as `id:` fields in a seed source file. The `\bid:`
 * boundary matches standalone id fields (skills, items, choices, blocks) but
 * NOT reference fields like `learning_item_id:` / `skill_id:`.
 */
function seedIds(relPath: string): string[] {
  const text = readFileSync(join(ROOT, relPath), "utf8");
  const matches = text.matchAll(/\bid:\s*"([a-z0-9]+(?:\.[a-z0-9_]+)+)"/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

const migrationSql = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
  .join("\n");

function missingFromMigrations(ids: string[]): string[] {
  return ids.filter((id) => !migrationSql.includes(`'${id}'`));
}

describe("seed <-> migration parity (#97)", () => {
  it("has migration files to check against", () => {
    expect(migrationSql.length).toBeGreaterThan(0);
  });

  it("every skill-seed id is present as a literal in a migration", () => {
    const ids = seedIds("src/features/skills/skill-seed.ts");
    expect(ids.length).toBeGreaterThan(100);
    expect(missingFromMigrations(ids)).toEqual([]);
  });

  it("every learning-item-seed id is present as a literal in a migration", () => {
    const ids = seedIds("src/features/learning-items/learning-item-seed.ts");
    expect(ids.length).toBeGreaterThan(800);
    expect(missingFromMigrations(ids)).toEqual([]);
  });
});
