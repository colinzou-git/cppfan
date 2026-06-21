import { PageShell } from "@/components/page-shell";
import { SkillMapPreview } from "@/features/skills/skill-map-preview";
import { MasteryPreview } from "@/features/mastery/mastery-preview";
import { DailyNew } from "@/features/goals/daily-new";
import { GoalDashboardCard } from "@/features/goals/goal-dashboard-card";
import { DailyReview } from "@/features/review/daily-review";
import { DashboardHeader } from "./dashboard-header";
import { DashboardAccount } from "./dashboard-account";
import { DashboardSetupCard } from "./dashboard-setup-card";
import type { getDashboardData } from "./dashboard-data";

type Data = Awaited<ReturnType<typeof getDashboardData>>;

export function DashboardSections({
  data,
  signOut,
  extraResult
}: {
  data: Data;
  signOut: () => Promise<void>;
  extraResult?: string;
}) {
  return (
    <PageShell className="grid gap-6" size="wide">
      <DashboardHeader />
      {extraResult ? (
        <p className={`rounded-2xl p-4 text-sm font-bold ${extraResult === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          {extraResult === "ok" ? "One Extra goal action was added for today." : `Learn Extra result: ${extraResult.replaceAll("_", " ")}.`}
        </p>
      ) : null}
      {!data.configured ? <DashboardSetupCard /> : null}

      {/* One vertical column on mobile; a 12-col split on xl+ with the learning
          work on the left and account/mastery/goals as a sticky right panel. */}
      <section className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="grid gap-6 xl:col-span-7 2xl:col-span-8">
          <DailyReview view={data.dailyReview} />
          <DailyNew plan={data.dailyNew} />
          <SkillMapPreview data={data.skillMap} itemLinksBySkill={data.itemLinks} />
        </div>

        <aside className="grid gap-6 xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-6">
          {data.account ? <DashboardAccount {...data.account} signOut={signOut} /> : null}
          <MasteryPreview summary={data.mastery} />
          <GoalDashboardCard model={data.goals} dailyNew={data.dailyNew} />
        </aside>
      </section>
    </PageShell>
  );
}
