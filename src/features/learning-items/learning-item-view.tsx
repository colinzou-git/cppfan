import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemHelpLinks } from "@/components/item-help-links";
import { AnswerForm } from "./answer-form";
import { ExplanationPanel } from "./explanation-panel";
import { FormattedContent } from "./formatted-content";
import { RevealExplanation } from "./reveal-explanation";
import { ParsonsExercise } from "./parsons-exercise";
import { CompletionExercise } from "./completion-exercise";
import { MathVisualization } from "./math-visualization";
import { MaybeCodeLab } from "@/features/code-lab/maybe-code-lab";
import { isCodeLabItem } from "@/features/code-lab/code-lab-catalog";
import { AddToReviewButton } from "@/features/review/add-to-review-button";
import {
  getPublicCompletionBlanksForItem,
  getPublicParsonsBlocksForItem,
  isReviewEligibleType
} from "./learning-item-seed";
import type { LearningItemType, LearningItemWithDetails } from "./learning-item-types";

const TYPE_LABELS: Record<LearningItemType, string> = {
  lesson: "Lesson",
  concept_check: "Concept check",
  multiple_choice: "Multiple choice",
  code_reading: "Code reading",
  bug_spotting: "Bug spotting",
  parsons: "Parsons puzzle",
  worked_example: "Worked example",
  completion: "Completion"
};

/*
 * Read-only view of a single learning item. Choice-based items list their
 * options statically; interactive answering and grading arrive in issue #3.
 */
export function LearningItemView({ data }: { data: LearningItemWithDetails }) {
  const { item, choices, skills } = data;
  const hasChoices = choices.length > 0;
  // Lessons show their explanation as lesson content. For graded/retrieval item
  // types the explanation often reveals the answer, so it is gated until after a
  // submission (in AnswerForm) or an explicit reveal (RevealExplanation) — #145.
  // A lesson and a worked example are instructional content: show the explanation
  // inline. Other (graded/retrieval) types gate it behind a reveal.
  const isLesson = item.type === "lesson" || item.type === "worked_example";
  const isParsons = item.type === "parsons";
  const parsonsBlocks = isParsons ? getPublicParsonsBlocksForItem(item.id) : [];
  const isCompletion = item.type === "completion";
  const completionBlanks = isCompletion ? getPublicCompletionBlanksForItem(item.id) : [];
  // Code Lab items use a side-by-side desktop layout: lesson/prompt on the left,
  // the Code Lab on the right (#431). Other items stay a single reading column.
  const hasCodeLab = isCodeLabItem(item.id);

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
      <CardContent
        className={
          hasCodeLab
            ? "grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)] xl:items-start"
            : "grid gap-5"
        }
      >
        <section className="grid min-w-0 gap-5">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
            <FormattedContent content={item.prompt} />
          </div>

          <MathVisualization itemId={item.id} />

          {hasChoices ? (
            <div data-testid="learning-item-choices">
              <AnswerForm itemId={item.id} choices={choices} explanation={item.explanation ?? null} />
            </div>
          ) : null}

          {isParsons && parsonsBlocks.length > 0 ? (
            <ParsonsExercise itemId={item.id} blocks={parsonsBlocks} />
          ) : null}

          {isCompletion && completionBlanks.length > 0 ? (
            <CompletionExercise itemId={item.id} blanks={completionBlanks} />
          ) : null}

          {item.explanation && isLesson ? <ExplanationPanel explanation={item.explanation} /> : null}

          {item.explanation && !isLesson && !hasChoices ? (
            <RevealExplanation explanation={item.explanation} />
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <ItemHelpLinks
              context={{
                schemaVersion: 1,
                sourceKind: isParsons || isCompletion ? "guided_exercise" : isLesson ? "learning_item" : "quiz_question",
                sourceId: item.id,
                sourceVersion: item.updated_at ?? "1",
                title: item.title,
                prompt: item.prompt,
                topic: skills.map((skill) => skill.skill_id).join(", ") || undefined,
                instructions: isParsons
                  ? parsonsBlocks.map((block) => `Available code line: ${block.content}`)
                  : isCompletion
                    ? completionBlanks.map((blank) => `Fill blank ${blank.position}.`)
                    : undefined,
                visibleChoices: choices.map((choice) => choice.content),
                visibleFeedback: isLesson ? item.explanation ?? undefined : undefined,
                assessmentState: isLesson ? "instructional" : "unanswered",
                revealPolicy: isLesson ? "normal" : "hint_only",
                metadata: {
                  itemType: item.type,
                  difficulty: item.difficulty,
                  estimatedMinutes: item.estimated_minutes
                }
              }}
            />
            {isReviewEligibleType(item.type) ? <AddToReviewButton itemId={item.id} /> : null}
          </div>
        </section>

        {/* MaybeCodeLab renders once. On xl it sits in a sticky right pane next to
            the lesson; on mobile it stacks below. Non-code items render nothing. */}
        {hasCodeLab ? (
          <aside className="min-w-0 xl:sticky xl:top-6">
            <MaybeCodeLab itemId={item.id} />
          </aside>
        ) : (
          <MaybeCodeLab itemId={item.id} />
        )}
      </CardContent>
    </Card>
  );
}
