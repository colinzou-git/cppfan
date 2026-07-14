"use server";

/*
 * Server actions for user-created content (#487). Thin, validated wrappers over
 * the trusted SECURITY DEFINER RPCs. The RPCs do the ownership + optimistic-
 * concurrency + transactional work; these actions validate the payload first
 * (so a bad draft never reaches the DB) and normalize the RPC result/errors.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContentItemForOwner } from "./user-content-queries";
import { parseLessonPayload, validateLessonForPublication } from "./user-content-schema";
import { buildUserContentExport, type UserContentExport } from "./user-content-export";
import type { AttachmentVisibility, UserContentKind, ValidationIssue } from "./user-content-types";

export type SaveDraftInput = {
  contentId?: string | null;
  kind?: UserContentKind;
  title: string;
  nativeModuleId?: string | null;
  recommendationEnabled?: boolean;
  expectedRevision?: number | null;
  payload: unknown;
};

export type SaveDraftResult =
  | { status: "ok"; contentId: string; draftVersionId: string; revision: number; savedAt: string }
  | { status: "invalid"; issues: ValidationIssue[] }
  | { status: "conflict" }
  | { status: "unconfigured" }
  | { status: "error" };

export async function saveLessonDraft(input: SaveDraftInput): Promise<SaveDraftResult> {
  const parsed = parseLessonPayload(input?.payload);
  if (!parsed.ok) {
    return { status: "invalid", issues: parsed.issues };
  }
  const title = typeof input?.title === "string" && input.title.trim().length > 0 ? input.title.trim() : parsed.value.title;

  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase.rpc("save_user_content_draft", {
    p_content_id: input?.contentId ?? null,
    p_kind: input?.kind ?? "lesson",
    p_title: title,
    p_native_module_id: input?.nativeModuleId ?? null,
    p_recommendation_enabled: input?.recommendationEnabled ?? true,
    p_schema_version: parsed.value.schemaVersion,
    p_payload: parsed.value,
    p_expected_revision: input?.expectedRevision ?? null
  });
  if (error) {
    return error.code === "40001" ? { status: "conflict" } : { status: "error" };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { content_id: string; draft_version_id: string; revision: number | string; saved_at: string }
    | undefined;
  if (!row) {
    return { status: "error" };
  }
  revalidatePath("/my-content");
  return {
    status: "ok",
    contentId: row.content_id,
    draftVersionId: row.draft_version_id,
    revision: Number(row.revision),
    savedAt: row.saved_at
  };
}

export type PublishResult =
  | { status: "ok"; contentId: string; skillId: string; learningItemId: string; versionNumber: number }
  | { status: "invalid"; issues: ValidationIssue[] }
  | { status: "conflict" }
  | { status: "not_found" }
  | { status: "unconfigured" }
  | { status: "error" };

export async function publishContent(input: { contentId: string; expectedRevision?: number | null }): Promise<PublishResult> {
  const contentId = typeof input?.contentId === "string" ? input.contentId : "";
  if (!contentId) {
    return { status: "error" };
  }
  // Validate the current draft before freezing it as published.
  const detail = await getContentItemForOwner(contentId);
  if (detail === null) {
    // No backend configured, or the item is not visible to this owner.
    const supabaseProbe = await createClient();
    return supabaseProbe ? { status: "not_found" } : { status: "unconfigured" };
  }
  if (!detail.draftPayload) {
    return { status: "invalid", issues: [{ field: "payload", message: "there is no draft to publish" }] };
  }
  const issues = validateLessonForPublication(detail.draftPayload);
  if (issues.length > 0) {
    return { status: "invalid", issues };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase.rpc("publish_user_content", {
    p_content_id: contentId,
    p_expected_revision: input?.expectedRevision ?? null
  });
  if (error) {
    return error.code === "40001" ? { status: "conflict" } : { status: "error" };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { out_content_id: string; out_skill_id: string; out_learning_item_id: string; out_version_number: number }
    | undefined;
  if (!row) {
    return { status: "error" };
  }
  revalidatePath("/my-content");
  return {
    status: "ok",
    contentId: row.out_content_id,
    skillId: row.out_skill_id,
    learningItemId: row.out_learning_item_id,
    versionNumber: Number(row.out_version_number)
  };
}

export type LifecycleResult =
  | { status: "ok" }
  | { status: "unconfigured" }
  | { status: "error" };

async function callSimpleRpc(fn: string, args: Record<string, unknown>): Promise<LifecycleResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { error } = await supabase.rpc(fn, args);
  if (error) {
    return { status: "error" };
  }
  revalidatePath("/my-content");
  return { status: "ok" };
}

export async function archiveContent(contentId: string): Promise<LifecycleResult> {
  if (!contentId) {
    return { status: "error" };
  }
  return callSimpleRpc("archive_user_content", { p_content_id: contentId });
}

export async function restoreContent(contentId: string): Promise<LifecycleResult> {
  if (!contentId) {
    return { status: "error" };
  }
  return callSimpleRpc("restore_user_content", { p_content_id: contentId });
}

export type DeleteMode = "archive" | "delete_editable" | "delete_all";

export async function deleteContent(contentId: string, mode: DeleteMode): Promise<LifecycleResult> {
  if (!contentId || !["archive", "delete_editable", "delete_all"].includes(mode)) {
    return { status: "error" };
  }
  return callSimpleRpc("delete_user_content", { p_content_id: contentId, p_mode: mode });
}

export type ExportResult =
  | { status: "ok"; export: UserContentExport }
  | { status: "not_found" }
  | { status: "unconfigured" }
  | { status: "error" };

/** Build a portable export (schema-versioned manifest + Markdown) for one item. */
export async function exportContent(contentId: string): Promise<ExportResult> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return { status: "error" };
  }
  const detail = await getContentItemForOwner(contentId);
  if (detail === null) {
    const probe = await createClient();
    return probe ? { status: "not_found" } : { status: "unconfigured" };
  }
  const data = buildUserContentExport(
    {
      id: detail.id,
      kind: detail.kind,
      title: detail.title,
      lifecycleStatus: detail.lifecycleStatus,
      nativeModuleId: detail.nativeModuleId,
      draftRevision: detail.draftRevision,
      updatedAt: detail.updatedAt,
      publishedAt: detail.publishedAt
    },
    detail.draftPayload,
    detail.publishedPayload
  );
  return { status: "ok", export: data };
}

export type ExternalAttachmentKind = "url" | "github_url" | "lesson_ref";

export type AddAttachmentInput = {
  contentId: string;
  kind: ExternalAttachmentKind;
  visibility: AttachmentVisibility;
  externalUrl?: string | null;
  referencedLearningItemId?: string | null;
  filename?: string | null;
};

export type AddAttachmentResult =
  | { status: "ok"; attachmentId: string }
  | { status: "invalid"; message: string }
  | { status: "unconfigured" }
  | { status: "error" };

export async function addExternalAttachment(input: AddAttachmentInput): Promise<AddAttachmentResult> {
  const kind = input?.kind;
  if (!["url", "github_url", "lesson_ref"].includes(kind)) {
    return { status: "invalid", message: "unsupported attachment kind" };
  }
  if (!input?.contentId) {
    return { status: "error" };
  }
  if ((kind === "url" || kind === "github_url") && !/^https:\/\//i.test(input.externalUrl ?? "")) {
    return { status: "invalid", message: "external URLs must be https" };
  }
  if (kind === "lesson_ref" && !(input.referencedLearningItemId ?? "").trim()) {
    return { status: "invalid", message: "a lesson reference needs a learning item id" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase.rpc("add_external_attachment", {
    p_content_id: input.contentId,
    p_kind: kind,
    p_visibility: input.visibility,
    p_external_url: input.externalUrl ?? null,
    p_referenced_learning_item_id: input.referencedLearningItemId ?? null,
    p_filename: input.filename ?? null
  });
  if (error) {
    return error.code === "22023" ? { status: "invalid", message: "attachment rejected" } : { status: "error" };
  }
  revalidatePath("/my-content");
  return { status: "ok", attachmentId: data as string };
}

export type RecordFileAttachmentInput = {
  contentId: string;
  kind: "file" | "image" | "pdf";
  visibility: AttachmentVisibility;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

/**
 * Record metadata for a file the client already uploaded to the private Storage
 * bucket. The add_file_attachment RPC re-checks ownership, the owner-namespaced
 * path, kind, and size limit, so a bad client call cannot forge a row.
 */
export async function recordFileAttachment(input: RecordFileAttachmentInput): Promise<AddAttachmentResult> {
  if (!input?.contentId || !["file", "image", "pdf"].includes(input?.kind)) {
    return { status: "invalid", message: "unsupported attachment kind" };
  }
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }
  const { data, error } = await supabase.rpc("add_file_attachment", {
    p_content_id: input.contentId,
    p_kind: input.kind,
    p_visibility: input.visibility,
    p_storage_path: input.storagePath,
    p_filename: input.filename,
    p_mime_type: input.mimeType,
    p_size_bytes: input.sizeBytes
  });
  if (error) {
    return error.code === "22023" ? { status: "invalid", message: "attachment rejected" } : { status: "error" };
  }
  revalidatePath("/my-content");
  return { status: "ok", attachmentId: data as string };
}

export async function setAttachmentVisibility(attachmentId: string, visibility: AttachmentVisibility): Promise<LifecycleResult> {
  if (!attachmentId || !["author_source", "learner_resource"].includes(visibility)) {
    return { status: "error" };
  }
  return callSimpleRpc("set_attachment_visibility", { p_attachment_id: attachmentId, p_visibility: visibility });
}

export async function removeAttachment(attachmentId: string): Promise<LifecycleResult> {
  if (!attachmentId) {
    return { status: "error" };
  }
  return callSimpleRpc("delete_attachment", { p_attachment_id: attachmentId });
}
