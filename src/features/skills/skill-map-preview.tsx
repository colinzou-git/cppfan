import Link from "next/link";
import { ArrowRight, Info, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSkillsForModule } from "./skill-seed";
import type { SkillMapPreviewData } from "./skill-types";

/*
 * Read-only preview of the C++ skill map. It renders the seeded modules and
 * their early skills. Prerequisites are shown as recommendations, never as
 * hard locks (see docs/SKILL_ENGINE.md). When a skill has a seeded learning
 * item, it links to that item. This component does not implement FSRS,
 * quizzes, reviews, or mastery scoring.
 */
export function SkillMapPreview({
  data,
  itemLinksBySkill = {}
}: {
  data: SkillMapPreviewData;
  itemLinksBySkill?: Record<string, string>;
}) {
  const modules = [...data.modules].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur" data-testid="skill-map-preview">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
          <Map className="h-5 w-5" />
        </div>
        <CardTitle>C++ skill map preview</CardTitle>
        <CardDescription>
          The first modules of the C++ learning path. This preview is read-only and shows where lessons,
          quizzes, and reviews will attach later.
        </CardDescription>
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-indigo-50/80 px-3 py-2 text-sm font-semibold text-indigo-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Prerequisites are recommendations, not hard locks. You can explore any skill in any order.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => {
          const skills = getSkillsForModule(module.id, data.skills);

          return (
            <section
              key={module.id}
              className="rounded-2xl border border-slate-100 bg-white/70 p-4"
              data-testid="skill-map-module"
            >
              <h3 className="text-base font-black tracking-tight text-slate-950">{module.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{module.description}</p>
              <ul className="mt-3 grid gap-2">
                {skills.map((skill) => {
                  const itemId = itemLinksBySkill[skill.id];

                  const body = (
                    <>
                      <span className="block text-slate-950">{skill.title}</span>
                      <span className="block text-xs font-medium text-slate-500">{skill.learner_goal}</span>
                    </>
                  );

                  if (itemId) {
                    return (
                      <li key={skill.id}>
                        <Link
                          href={`/learn/${encodeURIComponent(itemId)}`}
                          data-testid="skill-map-skill-link"
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
                        >
                          <span>{body}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-blue-600" />
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={skill.id}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {body}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
