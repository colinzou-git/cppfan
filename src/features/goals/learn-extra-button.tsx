"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { allocateExtraGoalInlineAction } from "@/app/goals/actions";

export function LearnExtraButton({ title }: { title: string }) {
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function allocate() {
    const formData = new FormData();
    formData.set("submission_id", submissionId);
    setMessage("Finding the next goal skill…");
    startTransition(async () => {
      const result = await allocateExtraGoalInlineAction(formData);
      if (result.status === "ok") {
        setSubmissionId(crypto.randomUUID());
        setMessage("Extra action added.");
        router.refresh();
        window.setTimeout(() => {
          const links = document.querySelectorAll<HTMLElement>('[data-source="learn_extra"] a');
          links.item(links.length - 1)?.focus();
        }, 100);
      } else {
        setMessage(result.status === "stale"
          ? "The plan changed in another tab. Refresh and try again."
          : `Learn Extra could not add work: ${result.status.replaceAll("_", " ")}.`);
      }
    });
  }

  return (
    <div className="grid justify-items-start gap-2">
      <Button type="button" variant="secondary" onClick={allocate} disabled={pending}>
        {pending ? "Finding the next goal skill…" : `Learn Extra: ${title}`}
      </Button>
      {message ? <p role="status" className="text-xs font-semibold text-slate-600">{message}</p> : null}
    </div>
  );
}
