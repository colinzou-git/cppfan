import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Guard for the authenticated /my-content routes (#487). When Supabase is
 * configured, a signed-out visitor is sent to login; without a backend (local
 * dev) the pages render in a read-only/local-only mode rather than redirecting.
 */
export async function requireOwnerSession(next: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!data?.user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
}
