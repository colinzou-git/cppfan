import { Button } from "@/components/ui/button";
import { cancelGoalAction } from "@/app/goals/actions";
import type { StudyGoalView } from "./goal-view-types";

function GoalCard({ goal, active }: { goal: StudyGoalView; active: boolean }) {
  return (
    <article className="grid gap-3 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{goal.title}</h3>
          <p className="text-sm text-slate-600">{goal.startLocalDate} through {goal.endLocalDate} · {goal.timezone}</p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black uppercase text-indigo-800">{goal.status}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {goal.targets.map((target) => (
          <span key={target.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {target.title}
          </span>
        ))}
      </div>
      {goal.recommendationReason ? <p className="text-sm text-slate-600">{goal.recommendationReason}</p> : null}
      {goal.learnerNote ? <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{goal.learnerNote}</p> : null}
      {active ? (
        <form action={cancelGoalAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="goal_id" value={goal.id} />
          <input type="hidden" name="expected_revision" value={goal.currentRevision} />
          <label className="grid flex-1 gap-1 text-xs font-bold text-slate-600">Cancellation note
            <input name="reason" className="h-10 rounded-xl border border-slate-200 px-3" />
          </label>
          <Button type="submit" variant="secondary">Cancel goal</Button>
        </form>
      ) : null}
    </article>
  );
}

export function GoalList({ title, goals, active = false }: { title: string; goals: StudyGoalView[]; active?: boolean }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      {goals.length ? goals.map((goal) => <GoalCard key={goal.id} goal={goal} active={active} />) : (
        <p className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm font-semibold text-slate-600">No goals in this view.</p>
      )}
    </section>
  );
}
