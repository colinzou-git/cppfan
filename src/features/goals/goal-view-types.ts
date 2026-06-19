import type {
  AcquisitionState,
  StudyGoalStatus,
  StudyGoalTargetKind,
  StudyGoalTargetSource
} from "./goal-contract";

export type StudyGoalTargetView = {
  id: string;
  goalId: string;
  revisionId: string;
  targetKind: StudyGoalTargetKind;
  referenceId: string;
  skillId: string | null;
  title: string;
  orderIndex: number;
  weight: number;
  acquisitionContractId: string;
  acquisitionContractVersion: number;
  source: StudyGoalTargetSource;
  baselineAcquisitionState: AcquisitionState;
};

export type StudyGoalView = {
  id: string;
  title: string;
  status: StudyGoalStatus;
  currentRevision: number;
  revisionId: string;
  startLocalDate: string;
  endLocalDate: string;
  timezone: string;
  recommendationSource: StudyGoalTargetSource;
  recommendationReason: string | null;
  learnerNote: string | null;
  createdAt: string;
  updatedAt: string;
  targets: StudyGoalTargetView[];
};

export type StudyGoalReadState =
  | "ready"
  | "signed_out"
  | "unconfigured"
  | "unavailable"
  | "error";

export type StudyGoalReadModel = {
  state: StudyGoalReadState;
  authenticated: boolean;
  active: StudyGoalView[];
  history: StudyGoalView[];
};
