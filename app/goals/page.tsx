import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { GoalForm } from "@/features/goals/goal-form";
import { GoalList } from "@/features/goals/goal-list";
import { GoalHeaderActions } from "@/features/goals/goal-header-actions";
import { getStudyGoalReadModel } from "@/features/goals/goal-queries";
import { getGoalEvaluationView } from "@/features/goals/evaluation-session-query";
import { getGoalEvaluationCatalog } from "@/features/goals/evaluation-catalog";
import { buildGoalEvaluationRecommendations } from "@/features/goals/evaluation-engine";
import { EvaluationResults } from "@/features/goals/evaluation-results";
import { EvaluationRecommendationTelemetry } from "@/features/goals/evaluation-recommendation-telemetry";
import { getStudyGoalHistoryPage } from "@/features/goals/goal-history-queries";
import { requireGoalsOnboarding } from "@/features/goals/goal-route-guard";
import { GoalDraftCleanup } from "@/features/goals/goal-draft-cleanup";

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ result?: string; history?: string }> }) {
  const params = await searchParams;
  await requireGoalsOnboarding("/goals");
  const [goals, evaluation, history] = await Promise.all([
    getStudyGoalReadModel(),
    getGoalEvaluationView(),
    getStudyGoalHistoryPage({ cursor: params.history, pageSize: 10 })
  ]);
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
    <PageShell className="grid gap-6" size="wide">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Dashboard</Link>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Goals</h1>
          <p className="text-slate-600">Plan unfinished initial learning without mixing it into FSRS review.</p>
        </div>
        <GoalHeaderActions />
      </header>

      {params.result ? (
        <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">
          {params.result === "ok" ? <GoalDraftCleanup /> : null}
          <p>Goal action result: {params.result}</p>
          {params.result === "stale" ? <Link href="/goals" className="underline">Reload latest and review changes</Link> : null}
        </div>
      ) : null}
      {goals.state === "unavailable" || goals.state === "error" ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Goal storage is unavailable. cppFan will not pretend an empty history is personalized data.
        </p>
      ) : null}

      {recommendations.length > 0 ? (
        <section className="grid gap-4 rounded-3xl border border-indigo-200 bg-indigo-50/80 p-5">
          {evaluation.sessionId ? <EvaluationRecommendationTelemetry sessionId={evaluation.sessionId} /> : null}
          <div>
            <h2 className="text-xl font-black text-indigo-950">Evaluation-informed suggestions</h2>
            <p className="text-sm text-indigo-900">These transparent priors preselect goal skills. Modify or ignore them freely.</p>
          </div>
          <EvaluationResults findings={evaluation.findings} />
        </section>
      ) : null}
      {/* Desktop: goal creation on the left, current/history lists in a sticky
          right column; mobile stacks in the same source order. */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] xl:items-start">
        <div className="grid gap-6">
          <GoalForm
            recommendedSkillIds={recommendations.map((item) => item.skillId)}
            recommendationReason={recommendationReason}
          />
        </div>
        <aside className="grid gap-6 xl:sticky xl:top-6">
          <GoalList title="Current" goals={goals.active} active />
          <GoalList title="History" goals={history.items} />
          {history.nextCursor ? (
            <Link href={`/goals?history=${history.nextCursor}`} className="justify-self-start rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800">
              Load older history
            </Link>
          ) : null}
        </aside>
      </section>
    </PageShell>
  );
}
