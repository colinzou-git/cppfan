"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GitBranch, Mail } from "lucide-react";
import { getAuthRedirectUrl, getSafeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthStatus =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function LoginClient() {
  const searchParams = useSearchParams();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>({ type: "idle", message: "" });
  const [pendingProvider, setPendingProvider] = useState<"google" | "email" | null>(null);

  const nextPath = useMemo(() => getSafeNextPath(searchParams.get("next")), [searchParams]);

  const queryMessage = searchParams.get("message");
  const queryError = searchParams.get("error");

  function getRedirectUrl() {
    return getAuthRedirectUrl(window.location.origin, nextPath);
  }

  async function signInWithGoogle() {
    const supabase = createClient();

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase is not configured yet. Add project URL and publishable key to .env.local."
      });
      return;
    }

    setPendingProvider("google");
    setStatus({ type: "idle", message: "" });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      setPendingProvider(null);
      setStatus({ type: "error", message: error.message });
    }
  }

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createClient();

    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase is not configured yet. Add project URL and publishable key to .env.local."
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({ type: "error", message: "Enter your email address first." });
      return;
    }

    setPendingProvider("email");
    setStatus({ type: "idle", message: "" });

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getRedirectUrl(),
        shouldCreateUser: true
      }
    });

    setPendingProvider(null);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message: "Check your email for a cppFan magic link. You can close this tab after clicking it."
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
            Continue with Google OAuth or request a passwordless email magic link.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!configured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local. Legacy
              NEXT_PUBLIC_SUPABASE_ANON_KEY also works as a fallback.
            </div>
          ) : null}

          {queryMessage === "signed-out" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              You have been signed out.
            </div>
          ) : null}

          {queryError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              Auth error: {queryError}
            </div>
          ) : null}

          {status.message ? (
            <div
              className={
                status.type === "success"
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                  : "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              }
            >
              {status.message}
            </div>
          ) : null}

          <Button
            disabled={!configured || pendingProvider !== null}
            onClick={signInWithGoogle}
            className="w-full"
            size="lg"
            type="button"
          >
            <GitBranch className="h-5 w-5" />
            {pendingProvider === "google" ? "Redirecting..." : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            or
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="grid gap-3" onSubmit={signInWithEmail}>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Email magic link
              <input
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                disabled={!configured || pendingProvider !== null}
                inputMode="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            <Button
              disabled={!configured || pendingProvider !== null}
              variant="secondary"
              className="w-full"
              size="lg"
              type="submit"
            >
              <Mail className="h-5 w-5" />
              {pendingProvider === "email" ? "Sending magic link..." : "Send magic link"}
            </Button>
          </form>

          <p className="pt-2 text-center text-xs text-slate-500">
            Next redirect: <code>{nextPath}</code>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
