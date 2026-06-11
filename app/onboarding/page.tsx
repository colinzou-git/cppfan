import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/profile-form";
import { getProfileForUser } from "@/features/profile/profile-queries";

type OnboardingSearchParams = Promise<{
  error?: string;
  next?: string;
}>;

export default async function OnboardingPage({ searchParams }: { searchParams: OnboardingSearchParams }) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next ?? "/dashboard");
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  let email: string | null = null;
  let profile = null;

  if (configured && supabase) {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect(`/login?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(nextPath)}`)}`);
    }

    email = user.email ?? null;
    profile = await getProfileForUser(user.id);

    if (profile?.onboarding_completed) {
      redirect(nextPath);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/" className="text-sm font-bold text-blue-700">
          ← cppFan
        </Link>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Onboarding</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          This is the first user-specific setup layer. Later, these settings will guide the skill map,
          daily review load, and recommended practice.
        </p>
      </div>

      <ProfileForm
        disabled={!configured}
        email={email}
        error={params.error}
        mode="onboarding"
        nextPath={nextPath}
        profile={profile}
      />
    </main>
  );
}
