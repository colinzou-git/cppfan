import type { LearningItemType } from "@/features/learning-items/learning-item-types";

export type AcquisitionEventRow = {
  event_type: string;
  metadata?: Record<string, unknown> | null;
};

/**
 * Project immutable skill events into exact-item acquisition success. Passive
 * lesson views, card existence, and later review logs are deliberately absent.
 */
export function isSuccessfulAcquisitionEvent(
  itemType: LearningItemType | undefined,
  event: AcquisitionEventRow
): boolean {
  if (itemType === "lesson") {
    return event.event_type === "lesson_self_assessed";
  }
  if (itemType === "worked_example") {
    return event.event_type === "worked_example_viewed";
  }
  if (itemType === "completion") {
    return event.event_type === "completion_submitted" && event.metadata?.is_correct === true;
  }
  if (itemType === "parsons") {
    return event.event_type === "parsons_submitted" && event.metadata?.is_correct === true;
  }
  return event.event_type === "quiz_correct" || event.event_type === "code_passed";
}
