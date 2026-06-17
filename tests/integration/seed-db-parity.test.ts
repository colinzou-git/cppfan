import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import { skillSeed } from "@/features/skills/skill-seed";

// Database-to-seed parity (#97). After CI applies all migrations to a DISPOSABLE
// LOCAL Supabase stack, this compares the ACTUAL migrated `skills` rows against the
// runtime TypeScript seed (no SQL-text parsing). It catches drift in BOTH
// directions: a skill migrated but missing from the seed, a seeded skill never
// migrated, and field/order drift on the stable structural fields. Self-skips when
// the SUPABASE_* env vars are absent so the default unit run is unaffected;
// runs in CI's Authenticated integration job (`pnpm test:integration`).

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && serviceKey);

const suite = ready ? describe : describe.skip;

// Structural stable fields compared in this slice. Long free-text (description,
// learner_goal) and item_types are a follow-up once this baseline is green.
const FIELDS = ["domain", "module_id", "title", "level", "order_index", "is_active"] as const;

type SkillRow = {
  id: string;
  domain: string;
  module_id: string;
  title: string;
  level: string;
  order_index: number;
  is_active: boolean;
};

suite("curriculum DB <-> TS seed parity (#97)", () => {
  let dbById = new Map<string, SkillRow>();

  beforeAll(async () => {
    const service: SupabaseClient = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await service
      .from("skills")
      .select("id,domain,module_id,title,level,order_index,is_active");
    if (error) throw error;
    dbById = new Map((data as SkillRow[]).map((r) => [r.id, r]));
  });

  it("has the same skill ids in the migrated DB and the TS seed (no drift either way)", () => {
    const seedIds = new Set(skillSeed.map((s) => s.id));
    const dbIds = new Set(dbById.keys());
    const missingFromDb = [...seedIds].filter((id) => !dbIds.has(id)).sort();
    const extraInDb = [...dbIds].filter((id) => !seedIds.has(id)).sort();
    expect(missingFromDb, "skills in the seed but not migrated").toEqual([]);
    expect(extraInDb, "skills migrated but absent from the seed").toEqual([]);
  });

  it("matches the stable structural fields between the DB and the seed", () => {
    const drift: string[] = [];
    for (const s of skillSeed) {
      const row = dbById.get(s.id);
      if (!row) {
        continue; // id-set test owns missing rows
      }
      for (const f of FIELDS) {
        if (row[f] !== s[f]) {
          drift.push(`${s.id}.${f}: db=${JSON.stringify(row[f])} seed=${JSON.stringify(s[f])}`);
        }
      }
    }
    expect(drift, `DB/seed field drift:\n${drift.join("\n")}`).toEqual([]);
  });
});
