// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";

/**
 * Cross-device persistence of the learner's in-progress Code Lab draft (#431),
 * bound to the immutable content version (#612). Like code-attempt-service, every
 * path is best-effort: it returns null / false (without throwing) when Supabase
 * is unconfigured, the learner is signed out, or the table/column is not migrated
 * yet, so the editor falls back to localStorage. The row is keyed
 * (user_id, learning_item_id, content_version_id) with user_id stamped from the
 * session and enforced by RLS; the client never supplies it. A null
 * content_version_id is a native/legacy unversioned draft.
 */
export async function loadCodeDraft(itemId: string, contentVersionId?: string | null): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("code_lab_drafts")
    .select("source_code")
    .eq("user_id", user.id)
    .eq("learning_item_id", itemId);
  query = contentVersionId ? query.eq("content_version_id", contentVersionId) : query.is("content_version_id", null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] draft load failed (code=${error.code ?? "none"})`);
    }
    return null;
  }

  return data?.source_code ?? null;
}

/**
 * The learner's most recent draft for this item under a DIFFERENT content version
 * — the explicit "copy from previous version" source (#612). Never returned as
 * the active draft; only offered as an intentional copy.
 */
export async function loadPreviousVersionDraft(itemId: string, contentVersionId?: string | null): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("code_lab_drafts")
    .select("source_code, content_version_id, updated_at")
    .eq("user_id", user.id)
    .eq("learning_item_id", itemId)
    .order("updated_at", { ascending: false })
    .limit(1);
  // Exclude the current version's own draft.
  if (contentVersionId) query = query.neq("content_version_id", contentVersionId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] previous draft load failed (code=${error.code ?? "none"})`);
    }
    return null;
  }
  return data?.source_code ?? null;
}

export async function saveCodeDraft(itemId: string, source: string, contentVersionId?: string | null): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("code_lab_drafts").upsert(
    {
      user_id: user.id,
      learning_item_id: itemId,
      content_version_id: contentVersionId ?? null,
      source_code: source,
      language: "cpp",
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,learning_item_id,content_version_id" }
  );

  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] draft save failed (code=${error.code ?? "none"})`);
    }
    return false;
  }

  return true;
}
