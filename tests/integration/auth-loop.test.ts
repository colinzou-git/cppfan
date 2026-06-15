import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyRating, createInitialSchedule } from "@/lib/fsrs/scheduler";

// Authenticated full-loop + RLS integration tests (#96).
//
// Runs against a DISPOSABLE LOCAL Supabase stack (`supabase start`) — never
// production. The stack ships well-known dev anon/service keys (not secrets). The
// suite creates two real authenticated learners and exercises the same RPCs and
// tables the app uses, proving: the learn -> grade -> attempt -> review -> rate ->
// event loop works under real auth; cross-user and anonymous access is denied;
// answer keys are not client-readable; and grading is DB-authoritative (no seed
// fallback). It self-skips when the SUPABASE_* env vars are absent so the default
// developer/unit run is unaffected.

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);

const ITEM_ID = "cpp.structs_classes.syntax.mc_default_access";
const PASSWORD = "Test-Password-123!";

const suite = ready ? describe : describe.skip;

function anonClient(): SupabaseClient {
  return createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

suite("authenticated learning loop + RLS isolation (#96)", () => {
  let service: SupabaseClient;
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let anon: SupabaseClient;
  let aId = "";
  let bId = "";
  let correctChoice = "";
  let wrongChoice = "";
  let skillId = "";
  let cardId = "";

  async function makeUser(email: string) {
    const { data, error } = await service.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true
    });
    if (error) throw error;
    return data.user!.id;
  }

  async function signIn(email: string): Promise<SupabaseClient> {
    const client = anonClient();
    const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (error) throw error;
    return client;
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });

    const stamp = Date.now();
    const emailA = `learner-a-${stamp}@example.test`;
    const emailB = `learner-b-${stamp}@example.test`;
    aId = await makeUser(emailA);
    bId = await makeUser(emailB);
    clientA = await signIn(emailA);
    clientB = await signIn(emailB);
    anon = anonClient();

    // Discover the answer key with privileged (service) access, so the test never
    // hard-codes which choice is correct.
    const { data: choices, error } = await service
      .from("learning_item_choices")
      .select("id,is_correct")
      .eq("learning_item_id", ITEM_ID)
      .order("order_index");
    if (error) throw error;
    correctChoice = (choices ?? []).find((c) => c.is_correct)!.id as string;
    wrongChoice = (choices ?? []).find((c) => !c.is_correct)!.id as string;

    const { data: mapping } = await service
      .from("learning_item_skills")
      .select("skill_id")
      .eq("learning_item_id", ITEM_ID)
      .eq("is_primary", true)
      .single();
    skillId = mapping!.skill_id as string;
  });

  afterAll(async () => {
    // Disposable cleanup: deleting the users cascades attempts/cards/logs/events.
    if (!service) return;
    for (const id of [aId, bId].filter(Boolean)) {
      await service.auth.admin.deleteUser(id).catch(() => undefined);
    }
  });

  it("creates two authenticated learners with distinct ids", () => {
    expect(aId).toBeTruthy();
    expect(bId).toBeTruthy();
    expect(aId).not.toBe(bId);
    expect(correctChoice).toBeTruthy();
    expect(wrongChoice).toBeTruthy();
    expect(skillId).toBeTruthy();
  });

  it("grades from the database answer key, not a client-supplied verdict", async () => {
    const wrong = await clientA.rpc("grade_learning_item_choice", {
      p_item_id: ITEM_ID,
      p_choice_id: wrongChoice
    });
    expect(wrong.error).toBeNull();
    expect(wrong.data?.[0]?.is_correct).toBe(false);

    const right = await clientA.rpc("grade_learning_item_choice", {
      p_item_id: ITEM_ID,
      p_choice_id: correctChoice
    });
    expect(right.error).toBeNull();
    expect(right.data?.[0]?.is_correct).toBe(true);
    expect(right.data?.[0]?.correct_choice_id).toBe(correctChoice);
  });

  it("never exposes the answer key (is_correct) to authenticated or anonymous clients", async () => {
    const asUser = await clientA.from("learning_item_choices").select("is_correct").limit(1);
    expect(asUser.error).not.toBeNull();

    const asAnon = await anon.from("learning_item_choices").select("is_correct").limit(1);
    expect(asAnon.error).not.toBeNull();
  });

  it("records an attempt only through the server-authoritative RPC", async () => {
    const rpc = await clientA.rpc("record_learning_item_attempt", {
      p_item_id: ITEM_ID,
      p_choice_id: correctChoice
    });
    expect(rpc.error).toBeNull();
    expect(rpc.data?.[0]?.is_correct).toBe(true);

    const rows = await clientA
      .from("learning_item_attempts")
      .select("user_id,learning_item_id")
      .eq("learning_item_id", ITEM_ID);
    expect(rows.error).toBeNull();
    expect((rows.data ?? []).length).toBeGreaterThanOrEqual(1);
    expect((rows.data ?? []).every((r) => r.user_id === aId)).toBe(true);

    // Direct client INSERT is revoked — forging an attempt must fail.
    const forged = await clientA.from("learning_item_attempts").insert({
      user_id: aId,
      learning_item_id: ITEM_ID,
      selected_choice_id: correctChoice,
      is_correct: true
    });
    expect(forged.error).not.toBeNull();
  });

  it("enrolls a review card the owner can read", async () => {
    const initial = createInitialSchedule(new Date());
    const upsert = await clientA
      .from("review_cards")
      .upsert(
        { user_id: aId, learning_item_id: ITEM_ID, skill_id: skillId, ...initial },
        { onConflict: "user_id,learning_item_id" }
      )
      .select("id")
      .single();
    expect(upsert.error).toBeNull();
    cardId = upsert.data!.id as string;
    expect(cardId).toBeTruthy();
  });

  it("applies a review rating atomically and appends a log", async () => {
    const card = await clientA.from("review_cards").select("*").eq("id", cardId).single();
    expect(card.error).toBeNull();
    const c = card.data!;
    const { schedule, log } = applyRating(
      {
        state: c.state,
        due_at: c.due_at,
        stability: c.stability,
        difficulty: c.difficulty,
        elapsed_days: c.elapsed_days,
        scheduled_days: c.scheduled_days,
        learning_steps: c.learning_steps,
        reps: c.reps,
        lapses: c.lapses,
        last_reviewed_at: c.last_reviewed_at
      },
      "good",
      new Date()
    );

    const rated = await clientA.rpc("apply_review_rating", {
      p_card_id: cardId,
      p_rating: "good",
      p_expected_reps: c.reps,
      p_submission_id: crypto.randomUUID(),
      p_schedule: schedule,
      p_log: log
    });
    expect(rated.error).toBeNull();
    expect(rated.data?.[0]?.status).toBe("ok");

    const logs = await clientA.from("review_logs").select("id").eq("review_card_id", cardId);
    expect(logs.error).toBeNull();
    expect((logs.data ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("records skill events the owner can read (mastery evidence)", async () => {
    const rpc = await clientA.rpc("record_skill_events", {
      p_events: [{ skill_id: skillId, learning_item_id: ITEM_ID, event_type: "quiz_correct" }]
    });
    expect(rpc.error).toBeNull();

    const events = await clientA.from("skill_events").select("skill_id,event_type").eq("skill_id", skillId);
    expect(events.error).toBeNull();
    expect((events.data ?? []).some((e) => e.event_type === "quiz_correct")).toBe(true);
  });

  it("isolates learner B from learner A's per-user data", async () => {
    const tables = ["learning_item_attempts", "review_cards", "review_logs", "skill_events"] as const;
    for (const table of tables) {
      const res = await clientB.from(table).select("user_id").eq("user_id", aId);
      expect(res.error).toBeNull();
      expect((res.data ?? []).length, `learner B saw ${table} of learner A`).toBe(0);
    }

    // B cannot mutate A's attempt rows (RLS scopes UPDATE/DELETE to the owner).
    const update = await clientB
      .from("review_cards")
      .update({ reps: 999 })
      .eq("user_id", aId)
      .select("id");
    expect((update.data ?? []).length).toBe(0);

    // B cannot read A's profile.
    const profile = await clientB.from("profiles").select("id").eq("id", aId);
    expect(profile.error).toBeNull();
    expect((profile.data ?? []).length).toBe(0);

    // Existing per-user project table.
    const capstone = await clientB
      .from("capstone_milestone_progress")
      .select("user_id")
      .eq("user_id", aId);
    expect(capstone.error).toBeNull();
    expect((capstone.data ?? []).length).toBe(0);
  });

  it("denies anonymous access to per-user tables", async () => {
    for (const table of ["learning_item_attempts", "review_cards", "skill_events"] as const) {
      const res = await anon.from(table).select("user_id");
      // Either RLS returns zero rows or PostgREST denies — both are acceptable.
      expect((res.data ?? []).length, `anon read rows from ${table}`).toBe(0);
    }
  });
});
