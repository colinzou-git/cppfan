import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cancelGoalAction, completeGoalAction, reopenGoalAction } from "@/app/goals/actions";
import type { StudyGoalView } from "./goal-view-types";

function LifecycleForm({
  goal,
  action,
  label,
  noteLabel
}: {
  goal: StudyGoalView;
  action: (formData: FormData) => Promise<void>;
  label: string;
  noteLabel: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="goal_id" value={goal.id} />
      <input type="hidden" name="expected_revision" value={goal.currentRevision} />
      <label className="grid min-w-48 flex-1 gap-1 text-xs font-bold text-slate-600">
        {noteLabel}
        <input name="reason" className="h-10 rounded-xl border border-slate-200 px-3" />
      </label>
      <Button type="submit" variant="secondary">{label}</Button>
    </form>
  );
}

function GoalCard({ goal, active }: { goal: StudyGoalView; active: boolean }) {
  return (
    <article className="grid gap-3 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{goal.title}</h3>
          <p className="text-sm text-slate-600">{goal.startLocalDate} through {goal.endLocalDate} · {goal.timezone}</p>
          <p className="text-xs font-semibold text-slate-500">Revision {goal.currentRevision} · {goal.targets.length} acquisition target{goal.targets.length === 1 ? "" : "s"}</p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black uppercase text-indigo-800">{goal.status}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {goal.targets.map((target) => (
          <span key={target.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {target.title} · {target.baselineAcquisitionState.replaceAll("_", " ")}
          </span>
        ))}
      </div>
      {goal.recommendationReason ? <p className="text-sm text-slate-600">{goal.recommendationReason}</p> : null}
      {goal.learnerNote ? <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{goal.learnerNote}</p> : null}
      <Button asChild variant="secondary"><Link href={`/goals/${goal.id}`}>Details and update</Link></Button>
      {active ? (
        <div className="grid gap-2 border-t border-slate-100 pt-3">
          <LifecycleForm goal={goal} action={completeGoalAction} label="Mark complete" noteLabel="Completion note" />
          <LifecycleForm goal={goal} action={cancelGoalAction} label="Cancel goal" noteLabel="Cancellation note" />
        </div>
      ) : (
        <LifecycleForm goal={goal} action={reopenGoalAction} label="Reopen goal" noteLabel="Reopen note" />
      )}
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
