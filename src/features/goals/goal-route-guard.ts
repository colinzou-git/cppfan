import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/features/profile/profile-queries";

export async function requireGoalsOnboarding(nextPath: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { data } = await supabase!.auth.getUser();
  if (!data.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const profile = await getProfileForUser(data.user.id);
  if (!profile?.onboarding_completed) redirect(`/onboarding?next=${encodeURIComponent(nextPath)}`);
}
