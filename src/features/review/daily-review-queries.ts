import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { nextLocalMidnight } from "@/lib/time/local-day";
import { buildDailyReviewItems, type DailyReviewCardRow } from "./daily-review-builder";
import type { DailyReviewView } from "./daily-review-model";
import { loadReviewItemContent } from "./review-item-loader";

const empty = (
  state: DailyReviewView["state"],
  authenticated: boolean,
  timezone: string
): DailyReviewView => ({ state, authenticated, timezone, items: [] });

export async function getDailyReviewView(
  timezone = "UTC",
  now: Date = new Date()
): Promise<DailyReviewView> {
  const supabase = await createClient();
  if (!supabase) return empty("unconfigured", false, timezone);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return empty("signed_out", false, timezone);

  const result = await supabase
    .from("review_cards")
    .select("id,learning_item_id,skill_id,due_at")
    .eq("user_id", auth.user.id)
    .lt("due_at", nextLocalMidnight(now, timezone).toISOString())
    .order("due_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(100);

  if (result.error) {
    if (isMissingObjectError(result.error)) return empty("unavailable", true, timezone);
    logConfiguredFailure("daily-review", result.error);
    return empty("error", true, timezone);
  }

  const rows = (result.data ?? []) as DailyReviewCardRow[];
  const content = await loadReviewItemContent(
    supabase,
    rows.map((row) => row.learning_item_id)
  );
  if (content.status !== "ok") {
    return empty(content.status, true, timezone);
  }
  const items = buildDailyReviewItems(rows, timezone, now, (itemId) => {
    const details = content.items.get(itemId);
    return details ? { ...details, skills: [] } : null;
  });

  return { state: "ready", authenticated: true, timezone, items };
}
