// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";

/**
 * Cross-device persistence of the learner's in-progress Code Lab draft (#431).
 * Like code-attempt-service, every path is best-effort: it returns null / false
 * (without throwing) when Supabase is unconfigured, the learner is signed out, or
 * the table is not migrated yet, so the editor falls back to localStorage. The
 * row is keyed (user_id, learning_item_id) with user_id stamped from the session
 * and enforced by RLS; the client never supplies it.
 */
export async function loadCodeDraft(itemId: string): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("code_lab_drafts")
    .select("source_code")
    .eq("user_id", user.id)
    .eq("learning_item_id", itemId)
    .maybeSingle();

  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] draft load failed (code=${error.code ?? "none"})`);
    }
    return null;
  }

  return data?.source_code ?? null;
}

export async function saveCodeDraft(itemId: string, source: string): Promise<boolean> {
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
      source_code: source,
      language: "cpp",
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,learning_item_id" }
  );

  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] draft save failed (code=${error.code ?? "none"})`);
    }
    return false;
  }

  return true;
}
