import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getStudyGoalReadModel } from "@/features/goals/goal-queries";
import { getDailyNewPlan } from "@/features/goals/daily-new-queries";
import { getDailyReviewView } from "@/features/review/daily-review-queries";
import { GoalEditForm } from "@/features/goals/goal-edit-form";

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const model = await getStudyGoalReadModel();
  const goal = [...model.active, ...model.history].find((candidate) => candidate.id === goalId);
  if (!goal) notFound();

  const [dailyNew, dailyReview] = await Promise.all([
    getDailyNewPlan(),
    getDailyReviewView(goal.timezone)
  ]);
  const goalActions = [...dailyNew.actions, ...(dailyNew.extraAction ? [dailyNew.extraAction] : [])]
    .filter((action) => action.goalIds.includes(goal.id));

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/goals" className="text-sm font-bold text-blue-700">← Goals</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-950">{goal.title}</h1>
            <p className="text-slate-600">{goal.startLocalDate} through {goal.endLocalDate} · {goal.timezone}</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black uppercase text-indigo-800">{goal.status}</span>
        </div>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-950">Acquisition targets</h2>
          <p className="text-sm text-slate-600">Initial acquisition is shown separately from later FSRS retention.</p>
        </div>
        {goal.targets.map((target) => (
          <article key={target.id} className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-black text-slate-950">{target.title}</h3>
            <p className="text-sm text-slate-600">Baseline state: {target.baselineAcquisitionState.replaceAll("_", " ")}</p>
            <p className="text-xs font-semibold text-slate-500">Contract {target.acquisitionContractId} v{target.acquisitionContractVersion}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Today</h2>
        <p className="text-sm text-slate-600"><strong>{goalActions.length}</strong> Daily New action{goalActions.length === 1 ? "" : "s"} contributes to this goal.</p>
        <p className="text-sm text-slate-600"><strong>{dailyReview.items.length}</strong> FSRS review{dailyReview.items.length === 1 ? "" : "s"} due through today, displayed separately.</p>
        {goalActions.map((action) => (
          <Button asChild variant="secondary" key={action.id}><Link href={action.href}>{action.source === "learn_extra" ? "Extra" : "Planned"}: {action.title}</Link></Button>
        ))}
      </section>

      {goal.status === "active" ? <GoalEditForm goal={goal} /> : (
        <p className="rounded-3xl bg-slate-100 p-5 text-sm font-semibold text-slate-700">Historical goals are read-only until reopened.</p>
      )}
    </main>
  );
}
