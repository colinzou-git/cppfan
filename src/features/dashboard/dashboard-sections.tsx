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

export function DashboardSections({ data, signOut }: { data: Data; signOut: () => Promise<void> }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader />
      {!data.configured ? <DashboardSetupCard /> : null}
      {data.account ? <DashboardAccount {...data.account} signOut={signOut} /> : null}
      <DailyReview view={data.dailyReview} />
      <DailyNew plan={data.dailyNew} />
      <MasteryPreview summary={data.mastery} />
      <GoalDashboardCard model={data.goals} />
      <SkillMapPreview data={data.skillMap} itemLinksBySkill={data.itemLinks} />
    </main>
  );
}
