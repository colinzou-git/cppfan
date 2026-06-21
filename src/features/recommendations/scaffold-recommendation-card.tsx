"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { ScaffoldRecommendation } from "./scaffold-selector-types";
import { SCAFFOLD_LEVEL_LABELS } from "./scaffold-reasons";

/**
 * Renders one adaptive scaffold recommendation (#415). It is a suggestion, never
 * a hard lock — the learner can keep browsing anything.
 */
export function ScaffoldRecommendationCard({
  recommendation
}: {
  recommendation: ScaffoldRecommendation | null;
}) {
  if (!recommendation) return null;

  return (
    <section
      className="flex flex-col gap-1.5 rounded-xl border border-sky-200 bg-sky-50 p-3"
      data-testid="scaffold-recommendation"
      data-level={recommendation.level}
      data-priority={recommendation.priority}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
        <GraduationCap className="h-4 w-4" aria-hidden="true" />
        Recommended next practice: {SCAFFOLD_LEVEL_LABELS[recommendation.level]}
      </p>
      <p className="text-xs text-sky-900">{recommendation.reason}</p>
      {recommendation.itemId ? (
        <Link
          href={`/learn/${recommendation.itemId}`}
          className="w-fit rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100"
          data-testid="scaffold-recommendation-link"
        >
          Open {SCAFFOLD_LEVEL_LABELS[recommendation.level]}
        </Link>
      ) : null}
      <p className="text-xs text-sky-700">This is a suggestion — you can practice anything you like.</p>
    </section>
  );
}
