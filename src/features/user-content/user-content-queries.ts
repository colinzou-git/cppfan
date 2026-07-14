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
import type { AttachmentVisibility, LessonPayload, UserContentKind, UserContentLifecycle } from "./user-content-types";

export type UserContentAttachment = {
  id: string;
  contentItemId: string;
  kind: "url" | "github_url" | "lesson_ref" | "file" | "image" | "pdf";
  visibility: AttachmentVisibility;
  externalUrl: string | null;
  referencedLearningItemId: string | null;
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
    .select("id,content_item_id,attachment_kind,visibility,external_url,referenced_learning_item_id,filename,created_at")
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
