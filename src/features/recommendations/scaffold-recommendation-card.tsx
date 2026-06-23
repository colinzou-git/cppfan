"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { MouseEvent } from "react";
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

  const levelLabel = SCAFFOLD_LEVEL_LABELS[recommendation.level];
  const href = recommendation.itemId ? `/learn/${recommendation.itemId}#code-lab` : "";

  function handleOpenRecommendation(event: MouseEvent<HTMLAnchorElement>) {
    if (!href || typeof window === "undefined") return;

    const target = new URL(href, window.location.origin);
    const current = new URL(window.location.href);
    const isSameLearningItem = target.pathname === current.pathname;

    if (!isSameLearningItem) return;

    const codeLab = document.getElementById("code-lab");
    if (!codeLab) return;

    event.preventDefault();
    window.history.replaceState(null, "", `${target.pathname}${target.hash}`);
    codeLab.scrollIntoView({ behavior: "smooth", block: "start" });

    const editor = codeLab.querySelector<HTMLElement>("[data-testid='code-editor']");
    editor?.focus({ preventScroll: true });
  }

  return (
    <section
      className="flex flex-col gap-1.5 rounded-xl border border-sky-200 bg-sky-50 p-3"
      data-testid="scaffold-recommendation"
      data-level={recommendation.level}
      data-priority={recommendation.priority}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
        <GraduationCap className="h-4 w-4" aria-hidden="true" />
        Recommended next practice: {levelLabel}
      </p>
      <p className="text-xs text-sky-900">{recommendation.reason}</p>
      {recommendation.itemId ? (
        <Link
          href={href}
          onClick={handleOpenRecommendation}
          className="w-fit rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100"
          data-testid="scaffold-recommendation-link"
        >
          Open {levelLabel}
        </Link>
      ) : null}
      <p className="text-xs text-sky-700">This is a suggestion — you can practice anything you like.</p>
    </section>
  );
}
