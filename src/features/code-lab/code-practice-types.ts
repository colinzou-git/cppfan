export type PracticeReferenceMode = "learner" | "current_standard" | "saved_standard";

export type CodePractice = {
  id: string;
  itemId: string;
  name: string;
  sourceCode: string;
  language: "cpp";
  skillIds: string[];
  contentVersionId: string | null;
  lessonSourceVersion: string;
  standardSourceCodeSnapshot: string;
  createdAt: string;
  updatedAt: string;
};

export type CodePracticeServiceStatus =
  | "ok"
  | "signed_out"
  | "not_found"
  | "not_eligible"
  | "unavailable";

export type CodePracticeServiceResult<T> =
  | { status: "ok"; data: T }
  | { status: Exclude<CodePracticeServiceStatus, "ok"> };

export type LessonPracticeContext = {
  itemId: string;
  skillIds: string[];
  currentStandardSource: string;
  lessonSourceVersion: string;
  contentVersionId: string | null;
};
