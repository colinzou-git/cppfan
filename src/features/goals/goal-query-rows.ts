import type {
  AcquisitionState,
  StudyGoalStatus,
  StudyGoalTargetKind,
  StudyGoalTargetSource
} from "./goal-contract";
import type { StudyGoalTargetView, StudyGoalView } from "./goal-view-types";

export type GoalRow = {
  id: string;
  title: string;
  status: StudyGoalStatus;
  current_revision: number;
  created_at: string;
  updated_at: string;
};

export type RevisionRow = {
  id: string;
  goal_id: string;
  revision_number: number;
  start_local_date: string;
  end_local_date: string;
  timezone: string;
  recommendation_source: StudyGoalTargetSource;
  recommendation_reason: string | null;
  learner_note: string | null;
};

export type TargetRow = {
  id: string;
  goal_id: string;
  revision_id: string;
  target_kind: StudyGoalTargetKind;
  target_reference_id: string;
  skill_id: string | null;
  title_snapshot: string;
  order_index: number;
  weight: number;
  acquisition_contract_id: string;
  acquisition_contract_version: number;
  source: StudyGoalTargetSource;
  baseline_acquisition_state: AcquisitionState;
};

export function toTargetView(row: TargetRow): StudyGoalTargetView {
  return {
    id: row.id,
    goalId: row.goal_id,
    revisionId: row.revision_id,
    targetKind: row.target_kind,
    referenceId: row.target_reference_id,
    skillId: row.skill_id,
    title: row.title_snapshot,
    orderIndex: row.order_index,
    weight: row.weight,
    acquisitionContractId: row.acquisition_contract_id,
    acquisitionContractVersion: row.acquisition_contract_version,
    source: row.source,
    baselineAcquisitionState: row.baseline_acquisition_state
  };
}

export function toGoalView(
  goal: GoalRow,
  revision: RevisionRow,
  targets: StudyGoalTargetView[]
): StudyGoalView {
  return {
    id: goal.id,
    title: goal.title,
    status: goal.status,
    currentRevision: goal.current_revision,
    revisionId: revision.id,
    startLocalDate: revision.start_local_date,
    endLocalDate: revision.end_local_date,
    timezone: revision.timezone,
    recommendationSource: revision.recommendation_source,
    recommendationReason: revision.recommendation_reason,
    learnerNote: revision.learner_note,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    targets
  };
}
