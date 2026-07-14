/*
 * Portable export for user-created content (#487).
 *
 * Produces both a schema-versioned JSON manifest and a human-readable Markdown
 * rendering of a lesson, from data the owner already has. Pure and I/O-free:
 * it never touches secrets, provider keys, signed URLs, or another user's data —
 * callers pass only the owner's own content. A future import feature can consume
 * the manifest; EXPORT_SCHEMA_VERSION guards its shape.
 */

import type { LessonPayload, UserContentKind, UserContentLifecycle } from "./user-content-types";

export const EXPORT_SCHEMA_VERSION = 1;

export type ExportItemMeta = {
  id: string;
  kind: UserContentKind;
  title: string;
  lifecycleStatus: UserContentLifecycle;
  nativeModuleId: string | null;
  draftRevision: number;
  updatedAt: string;
  publishedAt: string | null;
};

export type UserContentExport = {
  exportSchemaVersion: number;
  exportedAt: string;
  item: ExportItemMeta;
  draftPayload: LessonPayload | null;
  publishedPayload: LessonPayload | null;
  markdown: string;
};

function heading(level: number, text: string): string {
  return `${"#".repeat(level)} ${text}\n\n`;
}

function fenced(code: string, lang = "cpp"): string {
  return "```" + lang + "\n" + code + "\n```\n\n";
}

/** Render a lesson payload as readable Markdown. */
export function buildLessonMarkdown(payload: LessonPayload): string {
  const parts: string[] = [];
  parts.push(heading(1, payload.title || "Untitled lesson"));

  const meta: string[] = [`Type: ${payload.itemType}`];
  if (payload.difficulty) meta.push(`Difficulty: ${payload.difficulty}`);
  if (payload.estimatedMinutes) meta.push(`~${payload.estimatedMinutes} min`);
  parts.push(`_${meta.join(" · ")}_\n\n`);

  if (payload.tags && payload.tags.length > 0) {
    parts.push(`Tags: ${payload.tags.join(", ")}\n\n`);
  }
  if (payload.learningObjectives && payload.learningObjectives.length > 0) {
    parts.push(heading(2, "Learning objectives"));
    parts.push(payload.learningObjectives.map((o) => `- ${o}`).join("\n") + "\n\n");
  }

  parts.push(heading(2, "Lesson"));
  parts.push(payload.content.trim() + "\n\n");

  const sections = payload.sections;
  if (sections) {
    const ordered: [keyof typeof sections, string][] = [
      ["introduction", "Introduction"],
      ["syntax", "Syntax"],
      ["examples", "Examples"],
      ["commonMistakes", "Common mistakes"],
      ["bestPractices", "Best practices"],
      ["practice", "Practice"],
      ["summary", "Summary"],
      ["furtherReading", "Further reading"]
    ];
    for (const [key, label] of ordered) {
      const value = sections[key];
      if (value && value.trim().length > 0) {
        parts.push(heading(3, label));
        parts.push(value.trim() + "\n\n");
      }
    }
  }

  if (payload.examples && payload.examples.length > 0) {
    parts.push(heading(2, "Input / output examples"));
    payload.examples.forEach((ex, i) => {
      parts.push(`**Example ${i + 1}**\n\n`);
      parts.push(`- Input: \`${ex.input}\`\n- Output: \`${ex.output}\`\n`);
      if (ex.note) parts.push(`- Note: ${ex.note}\n`);
      parts.push("\n");
    });
  }

  if (payload.sampleCode) {
    parts.push(heading(2, "Sample code"));
    parts.push(fenced(payload.sampleCode));
  }
  if (payload.starterCode) {
    parts.push(heading(2, "Starter code"));
    parts.push(fenced(payload.starterCode));
  }
  if (payload.referenceSolution) {
    parts.push(heading(2, "Reference solution"));
    parts.push(fenced(payload.referenceSolution));
  }
  if (payload.expectedOutput) {
    parts.push(heading(2, "Expected output"));
    parts.push(fenced(payload.expectedOutput, "text"));
  }

  parts.push(heading(2, "Explanation"));
  parts.push(payload.explanation.trim() + "\n");

  return parts.join("");
}

/** Assemble the full export (manifest + Markdown) from the owner's own data. */
export function buildUserContentExport(
  item: ExportItemMeta,
  draftPayload: LessonPayload | null,
  publishedPayload: LessonPayload | null,
  now: Date = new Date()
): UserContentExport {
  const forMarkdown = publishedPayload ?? draftPayload;
  return {
    exportSchemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    item,
    draftPayload,
    publishedPayload,
    markdown: forMarkdown ? buildLessonMarkdown(forMarkdown) : ""
  };
}
