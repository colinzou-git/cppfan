import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyNewAction, DailyNewPlan } from "./daily-new-model";
import { LearnExtraButton } from "./learn-extra-button";

const NO_MORE_LABELS: Record<NonNullable<DailyNewPlan["noMoreReason"]>, string> = {
  all_goal_work_complete: "All active-goal acquisition work is complete.",
  daily_scope_exhausted: "Today’s safe goal-learning scope is exhausted.",
  content_unavailable: "The remaining goal content is currently unavailable.",
  only_fsrs_review_remains: "Only FSRS review work remains; check Daily Review.",
  backend_unavailable: "Goal learning recommendations are temporarily unavailable."
};

const ACTION_LABELS: Record<DailyNewAction["actionKind"], string> = {
  start_new_skill: "Start this skill",
  continue_acquisition: "Continue learning",
  prerequisite_acquisition: "Finish prerequisite"
};

const STATE_LABELS: Record<DailyNewAction["acquisitionState"], string> = {
  not_started: "Not started",
  in_progress: "In progress"
};

function ActionTile({ action }: { action: DailyNewAction }) {
  const sourceLabel = action.source === "learn_extra" ? "Extra" : "Planned";
  const effort = action.estimatedMinutes ? `about ${action.estimatedMinutes} min` : "time estimate unavailable";

  return (
    <li data-testid="daily-new-action" data-action-id={action.id} data-source={action.source}>
      <Link
        href={action.href}
        aria-label={`${sourceLabel}: ${ACTION_LABELS[action.actionKind]} - ${action.title}`}
        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-violet-200 hover:bg-violet-50/60"
      >
        <span className="min-w-0">
          <span className="mb-1 flex flex-wrap gap-1">
            <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black uppercase text-violet-800">
              {sourceLabel}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-700">
              {ACTION_LABELS[action.actionKind]}
            </span>
          </span>
          <span className="block break-words text-sm font-bold text-slate-950">{action.title}</span>
          <span className="block text-xs font-medium text-slate-500">{action.reason}</span>
          <span className="block break-words text-xs font-semibold text-violet-700">
            {action.goalTitles.join(" - ")} - {effort}
          </span>
          <span className="block text-xs font-medium text-slate-500">
            {STATE_LABELS[action.acquisitionState]} - learning item - {action.localPlanDate || "today"} - {action.timezone}
          </span>
          <span className="block text-xs font-medium text-slate-500">
            Completion: {action.completionEvidenceRule}
          </span>
          <span className="block text-xs font-medium text-slate-500">{action.platformNote}</span>
        </span>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-violet-600" />
      </Link>
    </li>
  );
}

export function DailyNew({ plan }: { plan: DailyNewPlan }) {
  const unavailable = plan.state === "unavailable" || plan.state === "error";
  const demo = plan.state === "unconfigured";
  const displayed = [...plan.actions, ...plan.allocatedExtraActions];
  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="daily-new-for-goals">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle>Daily New for Goals</CardTitle>
        <CardDescription>
          Unfinished initial-learning steps for active goals. FSRS reviews never appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {demo ? (
          <p className="rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
            Demo mode: Daily New for Goals is not personalized or saved until Supabase is configured.
          </p>
        ) : unavailable ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Goal learning recommendations are temporarily unavailable.
          </p>
        ) : plan.activeGoalCount === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-950">Set a dated goal to receive unfinished-learning steps.</p>
            <Button asChild size="sm"><Link href="/goals">Set a learning goal</Link></Button>
          </div>
        ) : displayed.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Today&apos;s planned acquisition work is complete, or your baseline new-skill cap is zero.
          </p>
        ) : (
          <ol className="grid gap-2">{displayed.map((action) => <ActionTile key={action.id} action={action} />)}</ol>
        )}
        {!demo && plan.extraAction ? (
          <LearnExtraButton title={plan.extraAction.title} />
        ) : !demo && plan.activeGoalCount > 0 && !unavailable ? (
          <p className="text-xs font-semibold text-slate-500">
            {plan.noMoreReason ? NO_MORE_LABELS[plan.noMoreReason] : "No additional safe unfinished goal action is available today."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
