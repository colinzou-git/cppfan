import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflowsDir = resolve(process.cwd(), ".github/workflows");
const migrationScriptPath = resolve(process.cwd(), "scripts/apply-migrations.sh");

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

  it("reloads PostgREST and refreshes its notification queue after applying migrations", () => {
    const migrationScript = readFileSync(migrationScriptPath, "utf8");

    expect(migrationScript).toContain(
      `psql "\${SUPABASE_DB_URL}" -v ON_ERROR_STOP=1 -q -c "NOTIFY pgrst, 'reload schema';"`
    );
    expect(migrationScript).toContain(
      `psql "\${SUPABASE_DB_URL}" -v ON_ERROR_STOP=1 -q -c "select pg_notification_queue_usage();"`
    );
    expect(migrationScript.indexOf("NOTIFY pgrst")).toBeGreaterThan(
      migrationScript.indexOf('run_migration_with_retry "${file}"')
    );
    expect(migrationScript.indexOf("select pg_notification_queue_usage()"))
      .toBeGreaterThan(migrationScript.indexOf("NOTIFY pgrst"));
  });
});
