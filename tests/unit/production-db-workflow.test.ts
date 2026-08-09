import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflowsDir = resolve(process.cwd(), ".github/workflows");

describe("production database migration workflow (#441)", () => {
  it("has one serialized workflow that applies migrations to production", () => {
    const productionMigrationWorkflows = readdirSync(workflowsDir)
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .filter((name) => {
        const yaml = readFileSync(resolve(workflowsDir, name), "utf8");
        return yaml.includes("SUPABASE_DB_URL") && yaml.includes("scripts/apply-migrations.sh");
      });

    expect(productionMigrationWorkflows).toEqual(["deploy-db.yml"]);

    const workflow = readFileSync(resolve(workflowsDir, "deploy-db.yml"), "utf8");
    expect(workflow).toMatch(/group:\s*production-db-migrations/);
    expect(workflow).toMatch(/cancel-in-progress:\s*false/);
  });
});
