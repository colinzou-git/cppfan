import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getStudyPlan } from "@/features/interview/interview-plan-store";
import { PLAN_HORIZONS, type PlanHorizonWeeks, type PlanRisk, type SessionType } from "@/features/interview/interview-plan";
import { routePlanTask } from "@/features/interview/interview-routing";

export const metadata = {
  title: "Interview study plan — cppFan"
};

type PlanSearchParams = Promise<{ weeks?: string; minutes?: string }>;

const DAILY_MINUTE_PRESETS = [30, 45, 60, 90];

const SESSION_LABEL: Record<SessionType, string> = {
  remediation: "Guided remediation",
  independent_timed: "Independent timed problem",
  mock_interview: "Full mock interview",
  maintenance: "Maintenance rep"
};

const RISK_LABEL: Record<PlanRisk, string> = {
  on_track: "On track",
  tight: "Tight",
  at_risk: "At risk",
  not_enough_evidence: "Not enough evidence"
};

const RISK_STYLE: Record<PlanRisk, string> = {
  on_track: "bg-emerald-100 text-emerald-800",
  tight: "bg-amber-100 text-amber-800",
  at_risk: "bg-rose-100 text-rose-800",
  not_enough_evidence: "bg-slate-100 text-slate-700"
};

function parseWeeks(value: string | undefined): PlanHorizonWeeks {
  const n = Number(value);
  return PLAN_HORIZONS.includes(n as PlanHorizonWeeks) ? (n as PlanHorizonWeeks) : 6;
}

function parseMinutes(value: string | undefined): number {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n <= 0) {
    return 45;
  }
  return Math.max(15, Math.min(120, n));
}

export default async function InterviewPlanPage({ searchParams }: { searchParams: PlanSearchParams }) {
  const params = await searchParams;
  const weeks = parseWeeks(params.weeks);
  const dailyMinutes = parseMinutes(params.minutes);
  const plan = await getStudyPlan(weeks, dailyMinutes);
  const route = routePlanTask(plan.nextTask);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <CalendarClock className="h-7 w-7 text-blue-700" />
          Study plan
        </h1>
        <p className="mt-1 text-slate-600">
          A personalized plan toward your target date, built from your{" "}
          <Link href="/interview/readiness" className="font-bold text-blue-700">
            readiness evidence
          </Link>
          . It sequences remediation, independent transfer, then mocks — and tells you the single
          highest-leverage thing to do next.
        </p>
      </header>

      <section className="grid gap-3" data-testid="plan-controls">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Target horizon:</span>
          {PLAN_HORIZONS.map((option) => (
            <Link
              key={option}
              href={`/interview/plan?weeks=${option}&minutes=${dailyMinutes}`}
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                option === weeks ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
              data-testid="plan-weeks-option"
              data-weeks={option}
            >
              {option} weeks
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Daily time:</span>
          {DAILY_MINUTE_PRESETS.map((option) => (
            <Link
              key={option}
              href={`/interview/plan?weeks=${weeks}&minutes=${option}`}
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                option === dailyMinutes ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
              data-testid="plan-minutes-option"
              data-minutes={option}
            >
              {option} min
            </Link>
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
        data-testid="plan-risk"
        data-risk={plan.risk}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Target-date risk:</span>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${RISK_STYLE[plan.risk]}`}>
            {RISK_LABEL[plan.risk]}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{plan.riskReason}</p>
      </section>

      <section
        className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm"
        data-testid="plan-next-task"
        data-session-type={plan.nextTask.sessionType}
      >
        <h2 className="text-lg font-black text-slate-900">Do this next</h2>
        <p className="mt-1 font-bold text-blue-900">
          {SESSION_LABEL[plan.nextTask.sessionType]} · ~{plan.nextTask.estimatedMinutes} min
        </p>
        <p className="mt-1 text-sm text-slate-700">{plan.nextTask.reason}</p>
        <p className="mt-1 text-sm text-slate-600">{plan.nextTask.guidance}</p>

        <div className="mt-3 rounded-xl border border-blue-300 bg-white/70 p-3" data-testid="plan-route" data-route-kind={route.kind}>
          <p className="font-bold text-slate-900">{route.title}</p>
          <p className="mt-1 text-sm text-slate-600">{route.detail}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
            <Link href={route.href} className="text-blue-700" data-testid="plan-route-link">
              Go →
            </Link>
            {route.externalUrl ? (
              <a
                href={route.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline"
                data-testid="plan-route-external"
              >
                Worked example ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
        data-testid="plan-today"
        data-task-count={plan.todayTasks.length}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-black text-slate-900">Today&rsquo;s plan</h2>
          <span className="text-sm font-semibold text-slate-600" data-testid="plan-today-budget">
            ~{plan.plannedMinutes} of {plan.dailyMinutes} min
          </span>
        </div>
        <ol className="mt-2 grid gap-2">
          {plan.todayTasks.map((task, index) => (
            <li
              key={`${task.sessionType}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3"
              data-testid="plan-today-task"
            >
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                {SESSION_LABEL[task.sessionType]}
              </span>
              <span className="text-xs font-semibold text-slate-500">~{task.estimatedMinutes} min</span>
              <span className="min-w-0 flex-1 text-sm text-slate-700">{task.reason}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs font-medium text-slate-500">
          Capped to your daily time — the plan never schedules more than your {plan.dailyMinutes}-minute
          budget for one day.
        </p>
      </section>

      <section className="grid gap-2" data-testid="plan-weeks">
        <h2 className="text-lg font-black text-slate-900">Week-by-week focus</h2>
        <ol className="grid gap-2">
          {plan.weeklyFocus.map((week) => (
            <li
              key={week.week}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
              data-testid="plan-week"
              data-week={week.week}
            >
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                Week {week.week}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {SESSION_LABEL[week.sessionType]}
              </span>
              <span className="min-w-0 flex-1 text-sm text-slate-700">{week.focus}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-xs font-medium text-slate-500">
        Catch-up is built in: missed days never punish you — the plan always recomputes from your most
        recent evidence, so it rebalances toward your weakest dimensions automatically.
      </p>
    </main>
  );
}
