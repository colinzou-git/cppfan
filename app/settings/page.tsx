import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getAiProviderPreferenceView } from "@/features/ai-chat/provider-preferences";
import { AiProviderSettingsForm } from "@/features/settings/ai-provider-settings-form";

export const dynamic = "force-dynamic";

type SettingsSearchParams = Promise<{
  error?: string;
  message?: string;
}>;

export default async function SettingsPage({ searchParams }: { searchParams: SettingsSearchParams }) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const supabase = await createClient();

  if (configured && supabase) {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login?next=/settings");
    }
  }

  const preference = await getAiProviderPreferenceView();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">
            ← Dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Settings</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Configure tutor chat provider behavior for this browser without exposing credentials to client components.
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {params.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          {params.message === "saved" ? "AI settings saved." : params.message}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
          {params.error}
        </div>
      ) : null}

      <AiProviderSettingsForm disabled={!configured} preference={preference} />
    </main>
  );
}
