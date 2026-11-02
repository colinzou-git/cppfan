import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const PASSWORD = "Test-Password-123!";
const RIGHT_ITEM = "cpp.concurrency.data_races.reasoning_lost_update";
const WRONG_ITEM = "cpp.concurrency.condition_variables.reasoning_shutdown_notify";
const suite = ready ? describe : describe.skip;

function anonClient(): SupabaseClient {
  return createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

suite("authenticated concurrency reasoning evidence (#704)", () => {
  let service: SupabaseClient;
  let client: SupabaseClient;
  let userId = "";

  async function correctAndWrongChoices(itemId: string) {
    const rows = await client.from("learning_item_choices").select("id").eq("learning_item_id", itemId).order("order_index");
    if (rows.error) throw rows.error;
    const ids = (rows.data ?? []).map((row) => row.id as string);
    const probe = await client.rpc("grade_learning_item_choice", { p_item_id: itemId, p_choice_id: ids[0] });
    if (probe.error) throw probe.error;
    const correct = probe.data![0].correct_choice_id as string;
    return { correct, wrong: ids.find((id) => id !== correct)! };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const email = `concurrency-704-${Date.now()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (created.error) throw created.error;
    userId = created.data.user!.id;
    client = anonClient();
    const signIn = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (service && userId) await service.auth.admin.deleteUser(userId).catch(() => undefined);
  });

  it("persists a correct code-reading answer and enrolls its normal review card", async () => {
    const { correct } = await correctAndWrongChoices(RIGHT_ITEM);
    const submit = await client.rpc("submit_learning_item_answer", {
      p_item_id: RIGHT_ITEM,
      p_choice_id: correct,
      p_submission_id: crypto.randomUUID()
    });
    expect(submit.error).toBeNull();
    expect(submit.data?.[0]?.is_correct).toBe(true);
    expect(submit.data?.[0]?.enrolled).toBe(true);

    const cards = await client.from("review_cards").select("id").eq("learning_item_id", RIGHT_ITEM);
    expect(cards.error).toBeNull();
    expect(cards.data).toHaveLength(1);
  });

  it("records a wrong bug-spotting answer without creating false correct evidence", async () => {
    const { wrong } = await correctAndWrongChoices(WRONG_ITEM);
    const submit = await client.rpc("submit_learning_item_answer", {
      p_item_id: WRONG_ITEM,
      p_choice_id: wrong,
      p_submission_id: crypto.randomUUID()
    });
    expect(submit.error).toBeNull();
    expect(submit.data?.[0]?.is_correct).toBe(false);

    const mapping = await client.from("learning_item_skills").select("skill_id").eq("learning_item_id", WRONG_ITEM).eq("is_primary", true).single();
    expect(mapping.error).toBeNull();
    const events = await client.from("skill_events").select("event_type").eq("skill_id", mapping.data!.skill_id);
    expect(events.error).toBeNull();
    const types = (events.data ?? []).map((event) => event.event_type);
    expect(types).toContain("quiz_attempted");
    expect(types).not.toContain("quiz_correct");
  });
});
