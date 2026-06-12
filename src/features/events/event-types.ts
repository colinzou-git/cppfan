import type { SkillEventName } from "./event-names";

export type SkillEvent = {
  id: string;
  user_id: string;
  skill_id: string | null;
  learning_item_id: string | null;
  review_card_id: string | null;
  event_type: SkillEventName;
  event_time: string;
  metadata: Record<string, unknown>;
  created_at?: string;
};

/** Minimal event shape used by mastery scoring (order matters by event_time). */
export type ScoringEvent = {
  event_type: SkillEventName;
  event_time: string;
};
