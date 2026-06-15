import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyRating } from "@/lib/fsrs/scheduler";
import { getPrimarySkillId } from "@/features/learning-items/learning-item-seed";

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
  let submissionId = "";

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

    // Discover the answer key WITHOUT any privileged read of is_correct (it is
    // locked even from service_role): read the public choice columns, then ask the
    // grade RPC, which returns the correct_choice_id authoritatively.
    const { data: choiceRows, error: choiceErr } = await clientA
      .from("learning_item_choices")
      .select("id")
      .eq("learning_item_id", ITEM_ID)
      .order("order_index");
    if (choiceErr) throw choiceErr;
    const ids = (choiceRows ?? []).map((r) => r.id as string);
    const graded = await clientA.rpc("grade_learning_item_choice", {
      p_item_id: ITEM_ID,
      p_choice_id: ids[0]
    });
    if (graded.error) throw graded.error;
    correctChoice = graded.data![0].correct_choice_id as string;
    wrongChoice = ids.find((id) => id !== correctChoice)!;

    // The primary skill comes from the curriculum seed (mirrors the DB); the app
    // uses the same mapping. review_cards.skill_id FKs to the migrated skills row.
    skillId = getPrimarySkillId(ITEM_ID)!;
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

  it("atomically records attempt + review card + skill events via one submit RPC", async () => {
    submissionId = crypto.randomUUID();
    const submit = await clientA.rpc("submit_learning_item_answer", {
      p_item_id: ITEM_ID,
      p_choice_id: correctChoice,
      p_submission_id: submissionId
    });
    expect(submit.error).toBeNull();
    expect(submit.data?.[0]?.status).toBe("ok");
    expect(submit.data?.[0]?.is_correct).toBe(true);
    expect(submit.data?.[0]?.enrolled).toBe(true);

    // All three kinds of evidence were committed together.
    const attempts = await clientA
      .from("learning_item_attempts")
      .select("user_id,is_correct")
      .eq("learning_item_id", ITEM_ID);
    expect(attempts.error).toBeNull();
    expect((attempts.data ?? []).length).toBe(1);
    expect((attempts.data ?? []).every((r) => r.user_id === aId)).toBe(true);

    const cards = await clientA.from("review_cards").select("id").eq("learning_item_id", ITEM_ID);
    expect(cards.error).toBeNull();
    expect((cards.data ?? []).length).toBe(1);
    cardId = cards.data![0].id as string;

    const events = await clientA.from("skill_events").select("event_type").eq("skill_id", skillId);
    expect(events.error).toBeNull();
    const types = (events.data ?? []).map((e) => e.event_type);
    expect(types).toContain("quiz_attempted");
    expect(types).toContain("quiz_correct");
  });

  it("is idempotent under the same submission id (no double write)", async () => {
    const replay = await clientA.rpc("submit_learning_item_answer", {
      p_item_id: ITEM_ID,
      p_choice_id: correctChoice,
      p_submission_id: submissionId
    });
    expect(replay.error).toBeNull();
    expect(replay.data?.[0]?.status).toBe("already_processed");

    const attempts = await clientA
      .from("learning_item_attempts")
      .select("id")
      .eq("learning_item_id", ITEM_ID);
    expect((attempts.data ?? []).length).toBe(1);
  });

  it("denies direct client INSERT into attempts and review cards (server-authoritative)", async () => {
    const forgedAttempt = await clientA.from("learning_item_attempts").insert({
      user_id: aId,
      learning_item_id: ITEM_ID,
      selected_choice_id: correctChoice,
      is_correct: true
    });
    expect(forgedAttempt.error).not.toBeNull();

    const forgedCard = await clientA
      .from("review_cards")
      .insert({ user_id: aId, learning_item_id: ITEM_ID, skill_id: skillId });
    expect(forgedCard.error).not.toBeNull();
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

  it("persists placement results per-user, isolates them, and resets (#125)", async () => {
    const row = { user_id: aId, module_id: "cpp.values_types", level: "start_here", correct: 0, total: 1 };
    const ins = await clientA.from("placement_results").upsert(row, { onConflict: "user_id,module_id" });
    expect(ins.error).toBeNull();

    const mine = await clientA.from("placement_results").select("module_id,level").eq("user_id", aId);
    expect(mine.error).toBeNull();
    expect((mine.data ?? []).some((r) => r.module_id === "cpp.values_types")).toBe(true);

    // Learner B and anon cannot read learner A's placement results.
    const asB = await clientB.from("placement_results").select("module_id").eq("user_id", aId);
    expect((asB.data ?? []).length).toBe(0);
    const asAnon = await anon.from("placement_results").select("module_id");
    expect((asAnon.data ?? []).length).toBe(0);

    // Reset deletes the learner's own rows.
    const del = await clientA.from("placement_results").delete().eq("user_id", aId);
    expect(del.error).toBeNull();
    const after = await clientA.from("placement_results").select("id").eq("user_id", aId);
    expect((after.data ?? []).length).toBe(0);
  });

  it("denies anonymous access to per-user tables", async () => {
    for (const table of ["learning_item_attempts", "review_cards", "skill_events"] as const) {
      const res = await anon.from(table).select("user_id");
      // Either RLS returns zero rows or PostgREST denies — both are acceptable.
      expect((res.data ?? []).length, `anon read rows from ${table}`).toBe(0);
    }
  });
});
