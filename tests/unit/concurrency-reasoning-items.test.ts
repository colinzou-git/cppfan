import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  isReviewEligibleItem,
  learningItemChoices,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";

const IDS = [
  "cpp.concurrency.threads.reasoning_join_trace",
  "cpp.concurrency.threads.reasoning_dangling_capture",
  "cpp.concurrency.data_races.reasoning_lost_update",
  "cpp.concurrency.data_races.reasoning_plain_flag",
  "cpp.concurrency.mutexes.reasoning_multi_field_invariant",
  "cpp.concurrency.mutexes.reasoning_manual_unlock",
  "cpp.concurrency.async.reasoning_exception_get",
  "cpp.concurrency.async.reasoning_default_policy",
  "cpp.concurrency.deadlock.reasoning_wait_cycle",
  "cpp.concurrency.deadlock.reasoning_scoped_lock",
  "cpp.concurrency.condition_variables.reasoning_predicate_trace",
  "cpp.concurrency.condition_variables.reasoning_shutdown_notify",
  "cpp.concurrency.atomics.reasoning_compound_check",
  "cpp.concurrency.atomics.reasoning_volatile_stop",
  "cpp.concurrency.jthread.reasoning_stop_trace",
  "cpp.concurrency.jthread.reasoning_blocked_wait",
  "cpp.concurrency.promise_future.reasoning_exception_channel",
  "cpp.concurrency.promise_future.reasoning_get_twice",
  "cpp.concurrency.task_selection.reasoning_io_concurrency",
  "cpp.concurrency.task_selection.reasoning_detached_poller",
  "cpp.concurrency.memory_ordering.reasoning_release_acquire",
  "cpp.concurrency.memory_ordering.reasoning_relaxed_publish",
  "cpp.concurrency.lock_granularity.reasoning_short_critical_section",
  "cpp.concurrency.lock_granularity.reasoning_shared_ref_escape",
  "cpp.concurrency.shared_state_design.reasoning_local_reduce",
  "cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation"
] as const;

describe("concurrency reasoning items (#704)", () => {
  it("registers 26 unique choice-backed review-eligible items", () => {
    expect(new Set(IDS).size).toBe(26);
    for (const id of IDS) {
      const details = getLearningItemById(id);
      expect(details, id).toBeTruthy();
      expect(["code_reading", "bug_spotting"]).toContain(details!.item.type);
      expect(isReviewEligibleItem(id), id).toBe(true);
      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === id);
      expect(choices).toHaveLength(4);
      expect(choices.filter((choice) => choice.is_correct)).toHaveLength(1);
    }
  });

  it("adds exactly one code-reading and one bug-spotting item to each original concurrency skill", () => {
    const reasoning = IDS.map((id) => getLearningItemById(id)!.item);
    const skillIds = new Set(
      learningItemSkills
        .filter((mapping) => IDS.includes(mapping.learning_item_id as (typeof IDS)[number]))
        .map((mapping) => mapping.skill_id)
    );
    expect(skillIds.size).toBe(13);

    for (const skillId of skillIds) {
      const mappedIds = learningItemSkills
        .filter((mapping) => mapping.skill_id === skillId && IDS.includes(mapping.learning_item_id as (typeof IDS)[number]))
        .map((mapping) => mapping.learning_item_id);
      const types = mappedIds.map((id) => reasoning.find((item) => item.id === id)!.type).sort();
      expect(types).toEqual(["bug_spotting", "code_reading"]);
    }
  });

  it("never bases correctness on scheduler timing", () => {
    for (const id of IDS) {
      const item = getLearningItemById(id)!.item;
      expect(`${item.prompt} ${item.explanation ?? ""}`).not.toMatch(/sleep_for|sleep_until|give .* thread time/i);
    }
  });
});
