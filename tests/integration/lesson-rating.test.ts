import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyRating, createInitialSchedule, type ReviewRating } from "@/lib/fsrs/scheduler";
import { learningItems, learningItemSkills } from "@/features/learning-items/learning-item-seed";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;
const password = "Test-Password-123!";
const lessons = learningItems.filter((item) => item.type === "lesson").slice(0, 6);

function primarySkill(itemId: string): string {
  const mapping = learningItemSkills.find(
    (row) => row.learning_item_id === itemId && row.is_primary
  );
  if (!mapping) throw new Error(`Primary skill missing for ${itemId}`);
  return mapping.skill_id;
}

suite("atomic initial lesson FSRS ratings (#687)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let userId = "";

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const email = `lesson-rating-${Date.now()}-${crypto.randomUUID()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user)
      throw created.error ?? new Error("user creation failed");
    userId = created.data.user.id;
    learner = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const signedIn = await learner.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw signedIn.error;
  });

  afterAll(async () => {
    if (service && userId) {
      await service.auth.admin.deleteUser(userId).catch(() => undefined);
    }
  });

  async function rate(
    itemId: string,
    displayedChoice: "hard" | "good" | "mastered",
    rating: Extract<ReviewRating, "hard" | "good" | "easy">,
    submissionId = crypto.randomUUID()
  ) {
    const now = new Date();
    const { schedule, log } = applyRating(createInitialSchedule(now), rating, now);
    return learner.rpc("apply_initial_lesson_rating", {
      p_item_id: itemId,
      p_submission_id: submissionId,
      p_displayed_choice: displayedChoice,
      p_rating: rating,
      p_schedule: schedule,
      p_log: log
    });
  }

  it("commits one card, log, exact evidence, allocation satisfaction, and idempotent replay", async () => {
    const item = lessons[0];
    const skillId = primarySkill(item.id);
    const goalId = crypto.randomUUID();
    const revisionId = crypto.randomUUID();
    const targetId = crypto.randomUUID();
    const allocationId = crypto.randomUUID();

    expect(
      (
        await service.from("study_goals").insert({
          id: goalId,
          user_id: userId,
          title: "Lesson rating allocation"
        })
      ).error
    ).toBeNull();
    expect(
      (
        await service.from("study_goal_revisions").insert({
          id: revisionId,
          goal_id: goalId,
          user_id: userId,
          revision_number: 1,
          start_local_date: "2026-08-19",
          end_local_date: "2026-08-25",
          timezone: "America/Los_Angeles",
          algorithm_version: "study-goals-v1",
          recommendation_source: "manual"
        })
      ).error
    ).toBeNull();
    expect(
      (
        await service.from("study_goal_targets").insert({
          id: targetId,
          goal_id: goalId,
          revision_id: revisionId,
          user_id: userId,
          target_kind: "acquire_skill",
          target_reference_id: skillId,
          skill_id: skillId,
          order_index: 0,
          acquisition_contract_id: "skill-initial-learning",
          acquisition_contract_version: 1,
          source: "manual",
          title_snapshot: item.title
        })
      ).error
    ).toBeNull();
    expect(
      (
        await service.from("study_goal_daily_allocations").insert({
          id: allocationId,
          user_id: userId,
          local_plan_date: "2026-08-19",
          timezone: "America/Los_Angeles",
          daily_plan_version: 1,
          goal_id: goalId,
          revision_id: revisionId,
          target_id: targetId,
          action_id: `lesson:${item.id}`,
          acquisition_step_id: item.id,
          source: "learn_extra",
          destination_kind: "learning_item",
          destination_id: item.id,
          algorithm_version: "daily-new-v1",
          acquisition_contract_version: 1
        })
      ).error
    ).toBeNull();

    const submissionId = crypto.randomUUID();
    const first = await rate(item.id, "hard", "hard", submissionId);
    expect(first.error).toBeNull();
    expect(first.data?.[0]).toMatchObject({ status: "ok", fsrs_rating: "hard" });
    const cardId = String(first.data?.[0]?.card_id);
    const firstDue = String(first.data?.[0]?.due_at);

    const replay = await rate(item.id, "hard", "hard", submissionId);
    expect(replay.error).toBeNull();
    expect(replay.data?.[0]).toMatchObject({
      status: "already_processed",
      card_id: cardId,
      due_at: firstDue,
      fsrs_rating: "hard"
    });

    const secondInitial = await rate(item.id, "good", "good");
    expect(secondInitial.error).toBeNull();
    expect(secondInitial.data?.[0]).toMatchObject({ status: "already_scheduled", card_id: cardId });

    const [cards, logs, events, allocation] = await Promise.all([
      learner.from("review_cards").select("id,reps").eq("learning_item_id", item.id),
      learner.from("review_logs").select("rating,submission_id").eq("review_card_id", cardId),
      learner.from("skill_events").select("event_type,metadata").eq("learning_item_id", item.id),
      service
        .from("study_goal_daily_allocations")
        .select("status,satisfied_evidence_key,disposition_reason")
        .eq("user_id", userId)
        .eq("id", allocationId)
        .single()
    ]);
    expect(cards.data).toHaveLength(1);
    expect(cards.data?.[0]?.reps).toBe(1);
    expect(logs.data).toEqual([{ rating: "hard", submission_id: submissionId }]);
    expect(events.data).toHaveLength(1);
    expect(events.data?.[0]).toMatchObject({
      event_type: "lesson_self_assessed",
      metadata: expect.objectContaining({ displayed_choice: "hard", fsrs_rating: "hard" })
    });
    expect(events.data?.some((row) => row.event_type === "skill_mastered")).toBe(false);
    expect(allocation.data).toMatchObject({
      status: "satisfied",
      disposition_reason: "lesson_self_assessed",
      satisfied_evidence_key: expect.stringMatching(/^skill_event:/)
    });
  });

  it("stores Good unchanged and Mastered as easy with a longer initial interval", async () => {
    const good = await rate(lessons[1].id, "good", "good");
    const mastered = await rate(lessons[2].id, "mastered", "easy");
    expect(good.error).toBeNull();
    expect(mastered.error).toBeNull();
    expect(good.data?.[0]?.fsrs_rating).toBe("good");
    expect(mastered.data?.[0]?.fsrs_rating).toBe("easy");
    expect(new Date(mastered.data?.[0]?.due_at).getTime()).toBeGreaterThan(
      new Date(good.data?.[0]?.due_at).getTime()
    );

    const log = await learner
      .from("review_logs")
      .select("rating")
      .eq("review_card_id", mastered.data?.[0]?.card_id)
      .single();
    expect(log.data?.rating).toBe("easy");
  });

  it("serializes two-tab initial ratings and rejects non-lessons without partial writes", async () => {
    const concurrentItem = lessons[3];
    const results = await Promise.all([
      rate(concurrentItem.id, "hard", "hard"),
      rate(concurrentItem.id, "mastered", "easy")
    ]);
    expect(results.every((result) => result.error === null)).toBe(true);
    expect(results.map((result) => result.data?.[0]?.status).sort()).toEqual([
      "already_scheduled",
      "ok"
    ]);
    const cards = await learner
      .from("review_cards")
      .select("id")
      .eq("learning_item_id", concurrentItem.id);
    expect(cards.data).toHaveLength(1);
    const logs = await learner
      .from("review_logs")
      .select("id")
      .eq("review_card_id", cards.data?.[0]?.id);
    expect(logs.data).toHaveLength(1);

    const nonLesson = learningItems.find((item) => item.type === "multiple_choice")!;
    const invalid = await rate(nonLesson.id, "good", "good");
    expect(invalid.error).toBeNull();
    expect(invalid.data?.[0]?.status).toBe("invalid");
    const invalidCard = await learner
      .from("review_cards")
      .select("id")
      .eq("learning_item_id", nonLesson.id);
    expect(invalidCard.data).toEqual([]);
  });
});
