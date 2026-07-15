/*
 * Owner-scoped reads for user-created content (#487).
 *
 * RLS restricts every user_content_* row to its owner, so these queries only
 * ever return the signed-in user's own items/versions. They return null / [] when
 * Supabase is not configured (e.g. local dev without a backend) rather than
 * throwing, matching the rest of the app's server-query style.
 */

import { createClient } from "@/lib/supabase/server";
import { parseLessonPayload } from "./user-content-schema";
import { parseExercisePayload } from "./exercise-content-schema";
import { parseLabPayload } from "./lab-content-schema";
import { isLearnerResourceFile } from "./attachment-upload";
import type { ExercisePayload } from "./exercise-content-types";
import type { LabPayload } from "./lab-content-types";
import type { AttachmentVisibility, LessonPayload, UserContentKind, UserContentLifecycle } from "./user-content-types";

export type UserContentAttachment = {
  id: string;
  contentItemId: string;
  kind: "url" | "github_url" | "lesson_ref" | "file" | "image" | "pdf";
  visibility: AttachmentVisibility;
  externalUrl: string | null;
  referencedLearningItemId: string | null;
  storagePath: string | null;
  filename: string | null;
  createdAt: string;
};

type AttachmentRow = {
  id: string;
  content_item_id: string;
  attachment_kind: UserContentAttachment["kind"];
  visibility: AttachmentVisibility;
  external_url: string | null;
  referenced_learning_item_id: string | null;
  storage_path: string | null;
  filename: string | null;
  created_at: string;
};

/** The owner's attachments for one content item (RLS keeps them owner-only). */
export async function getAttachmentsForOwner(contentId: string): Promise<UserContentAttachment[]> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return [];
  }
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("user_content_attachments")
    .select("id,content_item_id,attachment_kind,visibility,external_url,referenced_learning_item_id,storage_path,filename,created_at")
    .eq("content_item_id", contentId)
    .order("created_at", { ascending: true });
  if (error || !data) {
    return [];
  }
  return (data as AttachmentRow[]).map((r) => ({
    id: r.id,
    contentItemId: r.content_item_id,
    kind: r.attachment_kind,
    visibility: r.visibility,
    externalUrl: r.external_url,
    referencedLearningItemId: r.referenced_learning_item_id,
    storagePath: r.storage_path,
    filename: r.filename,
    createdAt: r.created_at
  }));
}

export type UserContentSummary = {
  id: string;
  kind: UserContentKind;
  title: string;
  lifecycleStatus: UserContentLifecycle;
  recommendationEnabled: boolean;
  draftRevision: number;
  updatedAt: string;
  publishedAt: string | null;
};

export type UserContentDetail = UserContentSummary & {
  nativeModuleId: string | null;
  draftPayload: LessonPayload | null;
  publishedPayload: LessonPayload | null;
};

type ItemRow = {
  id: string;
  kind: UserContentKind;
  title: string;
  lifecycle_status: UserContentLifecycle;
  recommendation_enabled: boolean;
  draft_revision: number;
  native_module_id: string | null;
  current_draft_version_id: string | null;
  current_published_version_id: string | null;
  updated_at: string;
  published_at: string | null;
};

function toSummary(row: ItemRow): UserContentSummary {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    lifecycleStatus: row.lifecycle_status,
    recommendationEnabled: row.recommendation_enabled,
    draftRevision: Number(row.draft_revision),
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
}

/** The signed-in user's content items, most-recently-updated first. */
export type ContentVersionSummary = {
  versionNumber: number;
  versionState: "draft" | "published" | "superseded";
  createdAt: string;
  publishedAt: string | null;
};

/** The owner's version history for one content item, newest first. */
export async function getContentVersions(contentId: string): Promise<ContentVersionSummary[]> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return [];
  }
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("user_content_versions")
    .select("version_number,version_state,created_at,published_at")
    .eq("content_item_id", contentId)
    .order("version_number", { ascending: false });
  if (error || !data) {
    return [];
  }
  return (data as Array<{ version_number: number; version_state: ContentVersionSummary["versionState"]; created_at: string; published_at: string | null }>).map(
    (r) => ({
      versionNumber: r.version_number,
      versionState: r.version_state,
      createdAt: r.created_at,
      publishedAt: r.published_at
    })
  );
}

export type SignedAttachment = { id: string; kind: UserContentAttachment["kind"]; filename: string | null; url: string };

/**
 * Learner-visible attachments for a published user lesson, each with a
 * short-lived signed URL (the bucket is private). Author-source attachments and
 * external references are excluded. Returns [] without a backend or when none.
 */
export async function getLearnerResourceAttachments(contentId: string): Promise<SignedAttachment[]> {
  const files = (await getAttachmentsForOwner(contentId)).filter((a) => isLearnerResourceFile(a));
  if (files.length === 0) {
    return [];
  }
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const signed: SignedAttachment[] = [];
  for (const attachment of files) {
    if (!attachment.storagePath) {
      continue;
    }
    const { data } = await supabase.storage
      .from("user-content-attachments")
      .createSignedUrl(attachment.storagePath, 300);
    if (data?.signedUrl) {
      signed.push({ id: attachment.id, kind: attachment.kind, filename: attachment.filename, url: data.signedUrl });
    }
  }
  return signed;
}

export async function getMyContentItems(): Promise<UserContentSummary[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("user_content_items")
    .select(
      "id,kind,title,lifecycle_status,recommendation_enabled,draft_revision,native_module_id,current_draft_version_id,current_published_version_id,updated_at,published_at"
    )
    .order("updated_at", { ascending: false });
  if (error || !data) {
    return [];
  }
  return (data as ItemRow[]).map(toSummary);
}

async function payloadForVersion(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  versionId: string | null
): Promise<LessonPayload | null> {
  if (!versionId) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_versions")
    .select("payload")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const parsed = parseLessonPayload((data as { payload: unknown }).payload);
  return parsed.ok ? parsed.value : null;
}

/** One content item plus its current draft and published payloads (owner only). */
export async function getContentItemForOwner(contentId: string): Promise<UserContentDetail | null> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return null;
  }
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_items")
    .select(
      "id,kind,title,lifecycle_status,recommendation_enabled,draft_revision,native_module_id,current_draft_version_id,current_published_version_id,updated_at,published_at"
    )
    .eq("id", contentId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const row = data as ItemRow;
  const [draftPayload, publishedPayload] = await Promise.all([
    payloadForVersion(supabase, row.current_draft_version_id),
    payloadForVersion(supabase, row.current_published_version_id)
  ]);
  return {
    ...toSummary(row),
    nativeModuleId: row.native_module_id,
    draftPayload,
    publishedPayload
  };
}

async function exercisePayloadForVersion(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  versionId: string | null
): Promise<ExercisePayload | null> {
  if (!versionId) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_versions")
    .select("payload")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const parsed = parseExercisePayload((data as { payload: unknown }).payload);
  return parsed.ok ? parsed.value : null;
}

export type UserExerciseDetail = UserContentSummary & {
  nativeModuleId: string | null;
  draftPayload: ExercisePayload | null;
  publishedPayload: ExercisePayload | null;
  /** Current published version id — used to detect a stale Code Lab tab (#488). */
  publishedVersionId: string | null;
};

/** The owner's exercise content item with its draft/published ExercisePayloads (#488). */
export async function getExerciseForOwner(contentId: string): Promise<UserExerciseDetail | null> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return null;
  }
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_items")
    .select(
      "id,kind,title,lifecycle_status,recommendation_enabled,draft_revision,native_module_id,current_draft_version_id,current_published_version_id,updated_at,published_at"
    )
    .eq("id", contentId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const row = data as ItemRow;
  if (row.kind !== "exercise") {
    return null;
  }
  const [draftPayload, publishedPayload] = await Promise.all([
    exercisePayloadForVersion(supabase, row.current_draft_version_id),
    exercisePayloadForVersion(supabase, row.current_published_version_id)
  ]);
  return {
    ...toSummary(row),
    nativeModuleId: row.native_module_id,
    draftPayload,
    publishedPayload,
    publishedVersionId: row.current_published_version_id ?? null
  };
}

async function labPayloadForVersion(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  versionId: string | null
): Promise<LabPayload | null> {
  if (!versionId) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_versions")
    .select("payload")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const parsed = parseLabPayload((data as { payload: unknown }).payload);
  return parsed.ok ? parsed.value : null;
}

export type UserLabDetail = UserContentSummary & {
  nativeModuleId: string | null;
  draftPayload: LabPayload | null;
  publishedPayload: LabPayload | null;
  /** Current published version id — used to detect a stale lab workspace (#489). */
  publishedVersionId: string | null;
};

/** The owner's lab content item with its draft/published LabPayloads (#489). */
export async function getLabForOwner(contentId: string): Promise<UserLabDetail | null> {
  if (typeof contentId !== "string" || contentId.length === 0) {
    return null;
  }
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from("user_content_items")
    .select(
      "id,kind,title,lifecycle_status,recommendation_enabled,draft_revision,native_module_id,current_draft_version_id,current_published_version_id,updated_at,published_at"
    )
    .eq("id", contentId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  const row = data as ItemRow;
  if (row.kind !== "lab") {
    return null;
  }
  const [draftPayload, publishedPayload] = await Promise.all([
    labPayloadForVersion(supabase, row.current_draft_version_id),
    labPayloadForVersion(supabase, row.current_published_version_id)
  ]);
  return {
    ...toSummary(row),
    nativeModuleId: row.native_module_id,
    draftPayload,
    publishedPayload,
    publishedVersionId: row.current_published_version_id ?? null
  };
}
