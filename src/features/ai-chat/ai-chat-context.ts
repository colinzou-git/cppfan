import {
  AI_CHAT_SOURCE_KINDS,
  type AiChatAssessmentState,
  type AiChatContext,
  type AiChatMetadataValue,
  type AiChatRevealPolicy,
  type AiChatSourceKind
} from "./ai-chat-types";

const MAX_SOURCE_ID = 240;
const MAX_SOURCE_VERSION = 120;
const MAX_TITLE = 300;
const MAX_TOPIC = 500;
const MAX_PROMPT = 12_000;
const MAX_LIST_ENTRY = 2_000;
const MAX_LIST_ITEMS = 24;
const MAX_DRAFT = 12_000;
const MAX_FEEDBACK = 8_000;
const MAX_METADATA_FIELDS = 20;
const MAX_METADATA_TEXT = 500;
const ALLOWED_METADATA_KEYS = new Set([
  "itemType",
  "difficulty",
  "estimatedMinutes",
  "reviewCardId",
  "projectId",
  "required",
  "milestoneCount",
  "sessionMode",
  "sessionStatus",
  "durationMinutes"
]);

const ASSESSMENT_STATES = new Set<AiChatAssessmentState>([
  "instructional",
  "unanswered",
  "answered",
  "revealed",
  "completed",
  "timed"
]);
const REVEAL_POLICIES = new Set<AiChatRevealPolicy>(["normal", "hint_only", "interviewer"]);
const SOURCE_KINDS = new Set<AiChatSourceKind>(AI_CHAT_SOURCE_KINDS);

type ParseResult =
  | { ok: true; value: AiChatContext }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, max: number, required = false): string | undefined {
  if (typeof value !== "string") return required ? "" : undefined;
  const normalized = value.replace(/\u0000/g, "").trim();
  if (!normalized && !required) return undefined;
  return normalized.slice(0, max);
}

function boundedTextList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const entries = value
    .slice(0, MAX_LIST_ITEMS)
    .map((entry) => boundedText(entry, MAX_LIST_ENTRY))
    .filter((entry): entry is string => Boolean(entry));
  return entries.length > 0 ? entries : undefined;
}

function boundedMetadata(value: unknown): Record<string, AiChatMetadataValue> | undefined {
  if (!isRecord(value)) return undefined;
  const entries: [string, AiChatMetadataValue][] = [];
  for (const [rawKey, rawValue] of Object.entries(value).slice(0, MAX_METADATA_FIELDS)) {
    const key = rawKey.trim().slice(0, 80);
    if (!key || !ALLOWED_METADATA_KEYS.has(key)) continue;
    if (typeof rawValue === "string") {
      entries.push([key, rawValue.slice(0, MAX_METADATA_TEXT)]);
    } else if (
      typeof rawValue === "number" ||
      typeof rawValue === "boolean" ||
      rawValue === null
    ) {
      entries.push([key, rawValue]);
    }
  }
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/**
 * Converts untrusted client input into an explicit learner-visible allowlist.
 * Unknown properties are discarded rather than spread into the provider payload.
 */
export function normalizeAiChatContext(value: unknown): ParseResult {
  if (!isRecord(value)) return { ok: false, error: "Context must be an object." };
  if (value.schemaVersion !== 1) {
    return { ok: false, error: "Unsupported AI context version." };
  }
  if (typeof value.sourceKind !== "string" || !SOURCE_KINDS.has(value.sourceKind as AiChatSourceKind)) {
    return { ok: false, error: "Unsupported AI source type." };
  }
  if (
    typeof value.assessmentState !== "string" ||
    !ASSESSMENT_STATES.has(value.assessmentState as AiChatAssessmentState)
  ) {
    return { ok: false, error: "Unsupported assessment state." };
  }
  if (
    typeof value.revealPolicy !== "string" ||
    !REVEAL_POLICIES.has(value.revealPolicy as AiChatRevealPolicy)
  ) {
    return { ok: false, error: "Unsupported reveal policy." };
  }

  const sourceId = boundedText(value.sourceId, MAX_SOURCE_ID, true);
  const sourceVersion = boundedText(value.sourceVersion, MAX_SOURCE_VERSION, true);
  const title = boundedText(value.title, MAX_TITLE, true);
  const prompt = boundedText(value.prompt, MAX_PROMPT, true);
  if (!sourceId || !sourceVersion || !title || !prompt) {
    return { ok: false, error: "Source identity, title, and visible prompt are required." };
  }

  const context: AiChatContext = {
    schemaVersion: 1,
    sourceKind: value.sourceKind as AiChatSourceKind,
    sourceId,
    sourceVersion,
    title,
    prompt,
    assessmentState: value.assessmentState as AiChatAssessmentState,
    revealPolicy: value.revealPolicy as AiChatRevealPolicy
  };

  const topic = boundedText(value.topic, MAX_TOPIC);
  const instructions = boundedTextList(value.instructions);
  const visibleChoices = boundedTextList(value.visibleChoices);
  const learnerDraft = boundedText(value.learnerDraft, MAX_DRAFT);
  const visibleFeedback = boundedText(value.visibleFeedback, MAX_FEEDBACK);
  const metadata = boundedMetadata(value.metadata);
  if (topic) context.topic = topic;
  if (instructions) context.instructions = instructions;
  if (visibleChoices) context.visibleChoices = visibleChoices;
  if (learnerDraft) context.learnerDraft = learnerDraft;
  if (visibleFeedback) context.visibleFeedback = visibleFeedback;
  if (metadata) context.metadata = metadata;
  return { ok: true, value: context };
}

function section(label: string, content?: string | string[]): string | null {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  const body = Array.isArray(content)
    ? content.map((entry, index) => `${index + 1}. ${entry}`).join("\n")
    : content;
  return `${label}:\n${body}`;
}

function defaultHelpRequest(context: AiChatContext): string {
  if (context.revealPolicy === "interviewer") {
    return "Act as an interviewer. Ask one guiding question at a time and do not reveal a complete solution.";
  }
  if (context.revealPolicy === "hint_only") {
    return "Give me a progressive hint or guiding question without revealing the final answer.";
  }
  if (context.sourceKind === "write_code_exercise") {
    return "Help me understand the task and plan a correct C++ approach. Point out likely pitfalls.";
  }
  if (
    context.sourceKind === "lab_item" ||
    context.sourceKind === "capstone_milestone" ||
    context.sourceKind === "project_lab"
  ) {
    return "Help me plan the next concrete step and check my reasoning.";
  }
  return "Explain the key idea clearly and help me reason through it.";
}

export function buildAiChatStarterPrompt(context: AiChatContext): string {
  const parts = [
    `I am working on this ${context.sourceKind.replaceAll("_", " ")} in cppFan.`,
    section("Title", context.title),
    section("Topic", context.topic),
    section("Visible prompt", context.prompt),
    section("Visible instructions", context.instructions),
    section("Visible choices", context.visibleChoices),
    section("My current draft", context.learnerDraft),
    section("Visible feedback", context.visibleFeedback),
    section("What I want from the tutor", defaultHelpRequest(context))
  ].filter((part): part is string => Boolean(part));

  return parts.join("\n\n").slice(0, 24_000);
}

export function fingerprintAiChatContext(context: AiChatContext): string {
  const serialized = JSON.stringify(context);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function isAiChatSourceKind(value: string): value is AiChatSourceKind {
  return SOURCE_KINDS.has(value as AiChatSourceKind);
}
