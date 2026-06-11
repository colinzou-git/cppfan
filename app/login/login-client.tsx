"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GitBranch, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LoginClient() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const configured = isSupabaseConfigured();

  async function signInWithGoogle() {
    const supabase = createClient();

    if (!supabase) {
      return;
    }

    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      }
    });
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-4 py-10">
      <Card className="w-full border-white/70 bg-white/85 shadow-xl backdrop-blur">
        <CardHeader>
          <Link href="/" className="mb-4 text-sm font-bold text-blue-700">
            ← cppFan
          </Link>
          <CardTitle>Sign in to cppFan</CardTitle>
          <CardDescription>
            Login is scaffolded for Supabase Auth. Add Supabase environment variables to enable it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!configured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
            </div>
          ) : null}

          <Button disabled={!configured} onClick={signInWithGoogle} className="w-full" size="lg">
            <GitBranch className="h-5 w-5" />
            Continue with Google
          </Button>

          <Button disabled variant="secondary" className="w-full" size="lg">
            <Mail className="h-5 w-5" />
            Email login coming next
          </Button>

          <p className="pt-2 text-center text-xs text-slate-500">
            Next redirect: <code>{nextPath}</code>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
