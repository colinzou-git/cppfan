import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, Brain, CalendarClock, Settings, ShieldAlert, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const nextItems = [
  {
    icon: CalendarClock,
    title: "Review queue",
    body: "FSRS review cards will appear here after the review engine is implemented."
  },
  {
    icon: Brain,
    title: "Weak skills",
    body: "Skill mastery and regression signals will appear after the event ledger is implemented."
  },
  {
    icon: BookOpenCheck,
    title: "Next lesson",
    body: "The first learning modules will cover structs/classes, constructors, RAII, and smart pointers."
  }
];

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase?.auth.signOut();

  redirect("/login?message=signed-out");
}

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const supabase = await createClient();
  let userEmail: string | null = null;

  if (configured && supabase) {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login?next=/dashboard");
    }

    userEmail = user.email ?? user.user_metadata?.email ?? "Signed-in learner";
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center">
        <div>
          <Link href="/" className="text-sm font-bold text-blue-700">
            ← cppFan
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Dashboard scaffold
          </h1>
          <p className="mt-1 text-slate-600">
            This protected dashboard placeholder is ready for auth, onboarding, reviews, and mastery.
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href="/login">
            <Settings className="h-4 w-4" />
            Auth setup
          </Link>
        </Button>
      </header>

      {!configured ? (
        <Card className="border-amber-200 bg-amber-50/90 shadow-sm">
          <CardHeader>
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <CardTitle>Supabase is not configured yet</CardTitle>
            <CardDescription>
              This route becomes fully protected after `NEXT_PUBLIC_SUPABASE_URL` and
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are added to `.env.local`.
              Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {configured && userEmail ? (
        <Card className="border-emerald-200 bg-emerald-50/90 shadow-sm">
          <CardHeader>
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <UserCircle className="h-5 w-5" />
            </div>
            <CardTitle>Signed in</CardTitle>
            <CardDescription>
              Auth is connected. Current learner: <span className="font-bold">{userEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {nextItems.map((item) => (
          <Card key={item.title} className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Next implementation milestones</CardTitle>
          <CardDescription>
            Keep these in separate focused PRs so Claude Code can use tests and CI as feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            {[
              "Add profile and onboarding",
              "Add skill map database model",
              "Add learning item and quiz model",
              "Add FSRS review cards and logs",
              "Add skill event ledger and mastery scoring",
              "Add first real structs/classes learning module"
            ].map((item) => (
              <li key={item} className="rounded-2xl bg-slate-100 px-4 py-3">
                {item}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </main>
  );
}
