/*
 * AI authoring prompt/message builder (#487).
 *
 * Pure counterpart of ai-chat-policy for the authoring assistant: it turns the
 * current lesson draft + selected author-source attachments + the author's
 * instruction into provider messages that ask the model to return a STRUCTURED
 * JSON proposal (never prose that overwrites the editor). The response is parsed
 * by parseAuthoringProposal and applied per-operation on accept. No I/O here.
 */

import type { AiProviderMessage } from "@/features/ai-chat/ai-chat-policy";
import type { LessonPayload } from "./user-content-types";

export type AuthoringAttachmentRef = {
  kind: "url" | "github_url" | "lesson_ref";
  url?: string | null;
  referencedLearningItemId?: string | null;
  filename?: string | null;
};

export type AuthoringRequest = {
  instruction: string;
  payload: LessonPayload;
  authorAttachments?: AuthoringAttachmentRef[];
};

const MAX_INSTRUCTION_CHARS = 4000;
const MAX_CONTEXT_FIELD_CHARS = 6000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function systemPrompt(): string {
  return [
    "You are cppFan's lesson-authoring assistant for C++, data structures, and algorithms.",
    "Help the author draft and improve a single private lesson.",
    "If the request is vague or missing information, ask ONE concise clarifying question instead of guessing.",
    "You must NEVER overwrite the author's work directly. Instead, respond with a single JSON object describing proposed changes the author can accept or reject.",
    "Return ONLY that JSON object inside a ```json code fence, with this exact shape:",
    '{ "summary": string, "operations": Operation[] }',
    "Each Operation is one of:",
    '- { "type": "replace_field", "field": "title"|"content"|"explanation"|"difficulty"|"sourceNotes"|"sampleCode"|"starterCode"|"referenceSolution"|"expectedOutput"|"solutionExplanation", "value": string }',
    '- { "type": "append_section", "section": "introduction"|"syntax"|"examples"|"commonMistakes"|"bestPractices"|"practice"|"summary"|"furtherReading", "value": string }',
    '- { "type": "set_objectives", "value": string[] }',
    '- { "type": "set_tags", "value": string[] }',
    '- { "type": "add_choice", "text": string, "isCorrect": boolean }',
    '- { "type": "add_parsons_block", "text": string, "correctOrder": number, "isDistractor": boolean }',
    '- { "type": "add_completion_blank", "position": number, "answer": string }',
    '- { "type": "add_review_card", "prompt": string, "choices": [{ "text": string, "isCorrect": boolean }], "explanation"?: string }',
    "For difficulty use only beginner, intermediate, or advanced.",
    "Only propose interactive operations (add_choice/add_parsons_block/add_completion_blank) that match the lesson's item type.",
    "add_review_card adds a supplementary multiple-choice review question (>=2 choices, exactly one or more correct); it applies to any lesson.",
    "Keep C++ technically correct; do not invent cppFan state, hidden tests, or claim your changes affect grading, mastery, or scheduling.",
    "Base your work only on the lesson draft and attachments provided here."
  ].join("\n");
}

function contextMessage(payload: LessonPayload, attachments: AuthoringAttachmentRef[]): string {
  const fields: string[] = [
    `Item type: ${payload.itemType}`,
    `Title: ${payload.title}`,
    payload.difficulty ? `Difficulty: ${payload.difficulty}` : "Difficulty: (unset)",
    `Content:\n${truncate(payload.content, MAX_CONTEXT_FIELD_CHARS)}`,
    `Explanation:\n${truncate(payload.explanation, MAX_CONTEXT_FIELD_CHARS)}`
  ];
  if (payload.learningObjectives?.length) {
    fields.push(`Objectives:\n${payload.learningObjectives.map((o) => `- ${o}`).join("\n")}`);
  }
  if (payload.tags?.length) {
    fields.push(`Tags: ${payload.tags.join(", ")}`);
  }
  if (payload.sections) {
    const filled = Object.entries(payload.sections)
      .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
      .map(([k]) => k);
    if (filled.length > 0) {
      fields.push(`Existing sections: ${filled.join(", ")}`);
    }
  }
  if (attachments.length > 0) {
    const lines = attachments.map((a) => {
      if (a.kind === "lesson_ref") {
        return `- lesson reference: ${a.referencedLearningItemId ?? ""}`;
      }
      return `- ${a.kind}: ${a.url ?? ""}${a.filename ? ` (${a.filename})` : ""}`;
    });
    fields.push(`Author-source references (for grounding only):\n${lines.join("\n")}`);
  }
  return fields.join("\n\n");
}

/** Build the provider messages for one authoring request. */
export function buildAuthoringMessages(request: AuthoringRequest): AiProviderMessage[] {
  const instruction = truncate(String(request?.instruction ?? "").trim(), MAX_INSTRUCTION_CHARS);
  const attachments = Array.isArray(request?.authorAttachments) ? request.authorAttachments : [];
  return [
    { role: "system", content: systemPrompt() },
    { role: "user", content: `Current lesson draft:\n\n${contextMessage(request.payload, attachments)}` },
    { role: "user", content: `Author request:\n${instruction}` }
  ];
}
