"use server";

/*
 * Persistence for owner-personal interview mock packs (#613). Best-effort and
 * RLS-owned like the other stores: returns [] / null quietly when Supabase is
 * unconfigured, the learner is signed out, or the table is not migrated yet, so
 * /interview/mocks still renders the built-in packs. On load, stored packs are
 * reconciled against the CURRENT candidate set so unavailable / version-changed
 * items are surfaced rather than silently substituted.
 */

import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getInterviewPlanningCandidates } from "./interview-planning-candidates";
import {
  reconcilePersonalMockPack,
  type MockPackReconciliation,
  type PersonalMockSelection
} from "./personal-mock-pack";

export type StoredPersonalMockPack = { id: string; title: string; items: PersonalMockSelection[] };
export type ReconciledPersonalMockPack = StoredPersonalMockPack & { reconciliation: MockPackReconciliation };

function coerceItems(value: unknown): PersonalMockSelection[] {
  if (!Array.isArray(value)) return [];
  const out: PersonalMockSelection[] = [];
  for (const raw of value) {
    if (raw && typeof raw === "object" && typeof (raw as { problemId?: unknown }).problemId === "string") {
      const r = raw as { problemId: string; source?: unknown; contentVersionId?: unknown };
      out.push({
        problemId: r.problemId,
        source: r.source === "user" ? "user" : "native",
        contentVersionId: typeof r.contentVersionId === "string" ? r.contentVersionId : null
      });
    }
  }
  return out;
}

/** Save (insert) a personal mock pack. Returns false (never throws) on failure. */
export async function savePersonalMockPack(input: { title: string; items: PersonalMockSelection[] }): Promise<boolean> {
  const title = typeof input?.title === "string" ? input.title.trim().slice(0, 200) : "";
  if (!title || !Array.isArray(input.items) || input.items.length === 0) return false;
  const supabase = await createClient();
  if (!supabase) return false;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("personal_mock_packs").insert({
    user_id: user.id,
    title,
    items: input.items.map((i) => ({ problemId: i.problemId, source: i.source, contentVersionId: i.contentVersionId ?? null }))
  });
  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[interview] personal mock pack save failed (code=${error.code ?? "none"})`);
    }
    return false;
  }
  return true;
}

/**
 * The learner's personal mock packs, each reconciled against the current
 * candidate set (#613). [] signed-out / unconfigured / pre-migration.
 */
export async function getReconciledPersonalMockPacks(): Promise<ReconciledPersonalMockPack[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("personal_mock_packs")
    .select("id, title, items")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error || !data) {
    if (error && !isMissingObjectError(error)) {
      console.error(`[interview] personal mock pack read failed (code=${error.code ?? "none"})`);
    }
    return [];
  }

  const candidates = await getInterviewPlanningCandidates().catch(() => []);
  return (data as Array<{ id: string; title: string; items: unknown }>).map((row) => {
    const items = coerceItems(row.items);
    return { id: row.id, title: row.title, items, reconciliation: reconcilePersonalMockPack(items, candidates) };
  });
}
