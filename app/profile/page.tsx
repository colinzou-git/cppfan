import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/features/profile/profile-form";
import { getProfileForUser } from "@/features/profile/profile-queries";

type ProfileSearchParams = Promise<{
  error?: string;
  message?: string;
  next?: string;
}>;

export default async function ProfilePage({ searchParams }: { searchParams: ProfileSearchParams }) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  const nextPath = getSafeNextPath(params.next ?? "/profile?message=saved");
  let email: string | null = null;
  let profile = null;

  if (configured && supabase) {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login?next=/profile");
    }

    email = user.email ?? null;
    profile = await getProfileForUser(user.id);

    if (!profile?.onboarding_completed) {
      redirect("/onboarding?next=/profile");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">
            ← Dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Profile</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Update your cppFan learning preferences before real skill recommendations are added.
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {params.message === "saved" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          Profile saved.
        </div>
      ) : null}

      <ProfileForm
        disabled={!configured}
        email={email}
        error={params.error}
        mode="profile"
        nextPath={nextPath}
        profile={profile}
      />
    </main>
  );
}
