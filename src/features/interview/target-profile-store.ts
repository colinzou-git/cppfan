import { createClient } from "@/lib/supabase/server";
import type {
  InterviewCppStandard,
  InterviewTarget,
  InterviewTargetProfileId,
  RecentInterviewPractice
} from "./target-profile";

export type InterviewTargetLoadResult =
  | { status: "ready"; target: InterviewTarget | null }
  | { status: "signed_out" | "unconfigured" | "unavailable"; target: null };

type TargetRow = {
  target_profile: InterviewTargetProfileId;
  cpp_standard: InterviewCppStandard;
  target_date: string | null;
  recent_practice: RecentInterviewPractice;
  updated_at: string;
};

function fromRow(row: TargetRow): InterviewTarget {
  return {
    targetProfile: row.target_profile,
    cppStandard: row.cpp_standard,
    targetDate: row.target_date,
    recentPractice: row.recent_practice,
    updatedAt: row.updated_at
  };
}

export async function getInterviewTarget(): Promise<InterviewTargetLoadResult> {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured", target: null };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "signed_out", target: null };

  const { data, error } = await supabase
    .from("interview_targets")
    .select("target_profile,cpp_standard,target_date,recent_practice,updated_at")
    .eq("user_id", auth.user.id)
    .maybeSingle<TargetRow>();

  if (error) return { status: "unavailable", target: null };
  return { status: "ready", target: data ? fromRow(data) : null };
}

export async function saveInterviewTarget(input: {
  targetProfile: InterviewTargetProfileId;
  cppStandard: InterviewCppStandard;
  targetDate: string | null;
  recentPractice: RecentInterviewPractice;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Sign in to save an interview target." };

  const { error } = await supabase.from("interview_targets").upsert(
    {
      user_id: auth.user.id,
      target_profile: input.targetProfile,
      cpp_standard: input.cppStandard,
      target_date: input.targetDate,
      recent_practice: input.recentPractice,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function resetInterviewTarget(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Sign in to reset the interview target." };

  const { error } = await supabase.from("interview_targets").delete().eq("user_id", auth.user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
