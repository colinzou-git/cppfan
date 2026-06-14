import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnswerForm } from "./answer-form";
import { ExplanationPanel } from "./explanation-panel";
import { RevealExplanation } from "./reveal-explanation";
import { ParsonsExercise } from "./parsons-exercise";
import { AddToReviewButton } from "@/features/review/add-to-review-button";
import { getPublicParsonsBlocksForItem, isReviewEligibleType } from "./learning-item-seed";
import type { LearningItemType, LearningItemWithDetails } from "./learning-item-types";

const TYPE_LABELS: Record<LearningItemType, string> = {
  lesson: "Lesson",
  concept_check: "Concept check",
  multiple_choice: "Multiple choice",
  code_reading: "Code reading",
  bug_spotting: "Bug spotting",
  parsons: "Parsons puzzle"
};

/*
 * Read-only view of a single learning item. Choice-based items list their
 * options statically; interactive answering and grading arrive in issue #3.
 */
export function LearningItemView({ data }: { data: LearningItemWithDetails }) {
  const { item, choices } = data;
  const hasChoices = choices.length > 0;
  // Lessons show their explanation as lesson content. For graded/retrieval item
  // types the explanation often reveals the answer, so it is gated until after a
  // submission (in AnswerForm) or an explicit reveal (RevealExplanation) — #145.
  const isLesson = item.type === "lesson";
  const isParsons = item.type === "parsons";
  const parsonsBlocks = isParsons ? getPublicParsonsBlocksForItem(item.id) : [];

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
          <div data-testid="learning-item-choices">
            <AnswerForm itemId={item.id} choices={choices} explanation={item.explanation ?? null} />
          </div>
        ) : null}

        {isParsons && parsonsBlocks.length > 0 ? (
          <ParsonsExercise itemId={item.id} blocks={parsonsBlocks} />
        ) : null}

        {item.explanation && isLesson ? <ExplanationPanel explanation={item.explanation} /> : null}

        {item.explanation && !isLesson && !hasChoices ? (
          <RevealExplanation explanation={item.explanation} />
        ) : null}

        {isReviewEligibleType(item.type) ? <AddToReviewButton itemId={item.id} /> : null}
      </CardContent>
    </Card>
  );
}
