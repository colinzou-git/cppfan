import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudyGoalReadModel } from "./goal-view-types";

export function GoalDashboardCard({ model }: { model: StudyGoalReadModel }) {
  const nearest = model.active.slice().sort((a, b) => a.endLocalDate.localeCompare(b.endLocalDate))[0];
  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="goals-entry">
      <CardHeader>
        <Target className="mb-3 h-6 w-6 text-indigo-700" />
        <CardTitle>Goals</CardTitle>
        <CardDescription>Dated initial-learning targets and their history.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-700">
          <p><strong>{model.active.length}</strong> active goal{model.active.length === 1 ? "" : "s"}</p>
          {nearest ? <p>Nearest deadline: <strong>{nearest.endLocalDate}</strong> — {nearest.title}</p> : null}
        </div>
        <Button asChild><Link href="/goals">{model.active.length ? "Open Goals" : "Set a learning goal"}</Link></Button>
      </CardContent>
    </Card>
  );
}
