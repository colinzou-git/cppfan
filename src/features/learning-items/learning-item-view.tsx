import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearningItemType, LearningItemWithDetails } from "./learning-item-types";

const TYPE_LABELS: Record<LearningItemType, string> = {
  lesson: "Lesson",
  concept_check: "Concept check",
  multiple_choice: "Multiple choice",
  code_reading: "Code reading",
  bug_spotting: "Bug spotting"
};

/*
 * Read-only view of a single learning item. Choice-based items list their
 * options statically; interactive answering and grading arrive in issue #3.
 */
export function LearningItemView({ data }: { data: LearningItemWithDetails }) {
  const { item, choices } = data;
  const hasChoices = choices.length > 0;

  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="learning-item">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <span
          className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600"
          data-testid="learning-item-type"
        >
          {TYPE_LABELS[item.type]}
        </span>
        <CardTitle className="mt-2">{item.title}</CardTitle>
        <CardDescription>
          {item.difficulty} · about {item.estimated_minutes} min
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
          {item.prompt}
        </div>

        {hasChoices ? (
          <div className="grid gap-2" data-testid="learning-item-choices">
            <p className="text-sm font-semibold text-slate-700">Choices</p>
            <ul className="grid gap-2">
              {choices.map((choice) => (
                <li
                  key={choice.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  {choice.content}
                </li>
              ))}
            </ul>
            <p className="text-xs font-medium text-slate-500">
              Answering and grading arrive in the next step. For now this item is read-only.
            </p>
          </div>
        ) : null}

        {item.explanation ? (
          <details className="rounded-2xl bg-emerald-50/80 p-4 text-sm text-emerald-950">
            <summary className="cursor-pointer font-bold">Show explanation</summary>
            <p className="mt-2 whitespace-pre-wrap break-words leading-6">{item.explanation}</p>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}
