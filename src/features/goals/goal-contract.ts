export const STUDY_GOAL_STATUSES = ["active", "completed", "expired", "cancelled"] as const;
export const ACQUISITION_STATES = ["not_started", "in_progress", "initial_learning_complete", "unavailable"] as const;
export const STUDY_GOAL_TARGET_KINDS = ["acquire_skill", "complete_initial_application"] as const;
export const STUDY_GOAL_TARGET_SOURCES = ["manual", "history_recommendation", "placement", "evaluation"] as const;

export type StudyGoalStatus = (typeof STUDY_GOAL_STATUSES)[number];
export type AcquisitionState = (typeof ACQUISITION_STATES)[number];
export type StudyGoalTargetKind = (typeof STUDY_GOAL_TARGET_KINDS)[number];
export type StudyGoalTargetSource = (typeof STUDY_GOAL_TARGET_SOURCES)[number];

export type StudyGoalTargetInput = {
  targetKind: StudyGoalTargetKind;
  referenceId: string;
  titleSnapshot: string;
  acquisitionContractId: string;
  acquisitionContractVersion: number;
  source: StudyGoalTargetSource;
  orderIndex: number;
  weight?: number;
};

export type StudyGoalRevisionInput = {
  title: string;
  startLocalDate: string;
  endLocalDate: string;
  timezone: string;
  recommendationSource: StudyGoalTargetSource;
  recommendationReason?: string;
  learnerNote?: string;
  targets: StudyGoalTargetInput[];
};

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseLocalDate(value: string): number | null {
  if (!LOCAL_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }
  return timestamp;
}

export function inclusiveGoalDurationDays(startLocalDate: string, endLocalDate: string): number | null {
  const start = parseLocalDate(startLocalDate);
  const end = parseLocalDate(endLocalDate);
  if (start === null || end === null || end < start) return null;
  return Math.floor((end - start) / DAY_MS) + 1;
}

export function isSupportedGoalDuration(startLocalDate: string, endLocalDate: string) {
  const duration = inclusiveGoalDurationDays(startLocalDate, endLocalDate);
  return duration !== null && duration >= 1 && duration <= 30;
}

export function isValidIanaTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(0);
    return timezone.includes("/") || timezone === "UTC";
  } catch {
    return false;
  }
}

export function validateStudyGoalRevision(input: StudyGoalRevisionInput): string[] {
  const errors: string[] = [];
  const title = input.title.trim();
  if (title.length < 2 || title.length > 120) errors.push("title_length");
  if (!isSupportedGoalDuration(input.startLocalDate, input.endLocalDate)) errors.push("date_range");
  if (!isValidIanaTimezone(input.timezone)) errors.push("timezone");
  if (input.targets.length < 1 || input.targets.length > 100) errors.push("target_count");

  const seen = new Set<string>();
  for (const target of input.targets) {
    const key = `${target.targetKind}:${target.referenceId}`;
    if (!target.referenceId.trim() || seen.has(key)) errors.push("target_reference");
    seen.add(key);
    if (!target.titleSnapshot.trim()) errors.push("target_title");
    if (!target.acquisitionContractId.trim() || target.acquisitionContractVersion < 1) errors.push("target_contract");
    if (!Number.isInteger(target.orderIndex) || target.orderIndex < 0) errors.push("target_order");
    if (target.weight !== undefined && (!Number.isFinite(target.weight) || target.weight <= 0)) errors.push("target_weight");
  }

  return [...new Set(errors)];
}
