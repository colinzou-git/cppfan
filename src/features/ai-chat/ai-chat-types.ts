export const AI_CHAT_SOURCE_KINDS = [
  "learning_item",
  "quiz_question",
  "review_question",
  "guided_exercise",
  "write_code_exercise",
  "lab_item",
  "capstone_milestone",
  "project_lab",
  "interview_question",
  "timed_interview_question"
] as const;

export type AiChatSourceKind = (typeof AI_CHAT_SOURCE_KINDS)[number];

export type AiChatAssessmentState =
  | "instructional"
  | "unanswered"
  | "answered"
  | "revealed"
  | "completed"
  | "timed";

export type AiChatRevealPolicy = "normal" | "hint_only" | "interviewer";

export type AiChatMetadataValue = string | number | boolean | null;

export type AiChatContext = {
  schemaVersion: 1;
  sourceKind: AiChatSourceKind;
  sourceId: string;
  sourceVersion: string;
  title: string;
  prompt: string;
  topic?: string;
  instructions?: string[];
  visibleChoices?: string[];
  learnerDraft?: string;
  visibleFeedback?: string;
  assessmentState: AiChatAssessmentState;
  revealPolicy: AiChatRevealPolicy;
  metadata?: Record<string, AiChatMetadataValue>;
};

export type AiChatMessageRole = "user" | "assistant";
export type AiChatMessageStatus = "streaming" | "complete" | "stopped" | "failed";

export type AiChatMessageView = {
  id: string;
  conversationId: string;
  requestId: string;
  role: AiChatMessageRole;
  content: string;
  status: AiChatMessageStatus;
  provider: string | null;
  model: string | null;
  createdAt: string;
};

export type AiChatConversationView = {
  id: string;
  sourceKind: AiChatSourceKind;
  sourceId: string;
  sourceVersion: string;
  title: string;
  provider: string | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
  messages: AiChatMessageView[];
};

export type AiChatHistoryResponse = {
  conversations: AiChatConversationView[];
};

export type AiChatStreamEvent =
  | {
      type: "meta";
      conversationId: string;
      requestId: string;
      provider: string;
      model: string;
    }
  | { type: "delta"; text: string }
  | { type: "done"; status: "complete" | "stopped" }
  | {
      type: "error";
      code: string;
      message: string;
      retryAfterSeconds?: number;
    };

export type AiChatApiError = {
  error: {
    code: string;
    message: string;
    retryAfterSeconds?: number;
  };
};
