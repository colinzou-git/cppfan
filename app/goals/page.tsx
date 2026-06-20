import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { GoalForm } from "@/features/goals/goal-form";
import { GoalList } from "@/features/goals/goal-list";
import { GoalHeaderActions } from "@/features/goals/goal-header-actions";
import { getStudyGoalReadModel } from "@/features/goals/goal-queries";
import { getGoalEvaluationView } from "@/features/goals/evaluation-session-query";
import { getGoalEvaluationCatalog } from "@/features/goals/evaluation-catalog";
import { buildGoalEvaluationRecommendations } from "@/features/goals/evaluation-engine";
import { EvaluationResults } from "@/features/goals/evaluation-results";

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const params = await searchParams;
  const [goals, evaluation] = await Promise.all([getStudyGoalReadModel(), getGoalEvaluationView()]);
  if (isSupabaseConfigured() && goals.state === "signed_out") redirect("/login?next=/goals");
  const evaluationIsCurrent = evaluation.expiresAt
    ? new Date(evaluation.expiresAt).getTime() > Date.now()
    : false;
  const recommendations = evaluation.state === "ready" && evaluation.status === "completed" && evaluationIsCurrent
    ? buildGoalEvaluationRecommendations(getGoalEvaluationCatalog(), evaluation.findings)
    : [];
  const recommendationReason = recommendations.length > 0
    ? `Goal Evaluation: ${recommendations.map((item) => `${item.moduleId} - ${item.reason}`).join("; ")}`
    : undefined;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Goals</h1>
          <p className="text-slate-600">Plan unfinished initial learning without mixing it into FSRS review.</p>
        </div>
        <GoalHeaderActions />
      </header>

      {params.result ? (
        <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">Goal action result: {params.result}</p>
      ) : null}
      {goals.state === "unavailable" || goals.state === "error" ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Goal storage is unavailable. cppFan will not pretend an empty history is personalized data.
        </p>
      ) : null}

      {recommendations.length > 0 ? (
        <section className="grid gap-4 rounded-3xl border border-indigo-200 bg-indigo-50/80 p-5">
          <div>
            <h2 className="text-xl font-black text-indigo-950">Evaluation-informed suggestions</h2>
            <p className="text-sm text-indigo-900">These transparent priors preselect goal skills. Modify or ignore them freely.</p>
          </div>
          <EvaluationResults findings={evaluation.findings} />
        </section>
      ) : null}
      <GoalForm
        recommendedSkillIds={recommendations.map((item) => item.skillId)}
        recommendationReason={recommendationReason}
      />
      <GoalList title="Current" goals={goals.active} active />
      <GoalList title="History" goals={goals.history} />
    </main>
  );
}
