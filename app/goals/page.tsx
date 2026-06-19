import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { GoalForm } from "@/features/goals/goal-form";
import { GoalList } from "@/features/goals/goal-list";
import { getStudyGoalReadModel } from "@/features/goals/goal-queries";

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const params = await searchParams;
  const goals = await getStudyGoalReadModel();
  if (isSupabaseConfigured() && goals.state === "signed_out") redirect("/login?next=/goals");

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Goals</h1>
          <p className="text-slate-600">Plan unfinished initial learning without mixing it into FSRS review.</p>
        </div>
        <Button asChild variant="secondary"><Link href="/placement">Run placement</Link></Button>
      </header>

      {params.result ? (
        <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">Goal action result: {params.result}</p>
      ) : null}
      {goals.state === "unavailable" || goals.state === "error" ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Goal storage is unavailable. cppFan will not pretend an empty history is personalized data.
        </p>
      ) : null}

      <GoalForm />
      <GoalList title="Current" goals={goals.active} active />
      <GoalList title="History" goals={goals.history} />
    </main>
  );
}
