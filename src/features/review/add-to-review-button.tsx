"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToReview } from "./review-actions";

/**
 * Deliberate "add to review" control (#142, rule C). Lets a learner enroll the
 * current item for spaced review on demand. Idempotent on the server, so a second
 * press just confirms the item is queued.
 */
export function AddToReviewButton({ itemId }: { itemId: string }) {
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await addToReview({ itemId });
      setState(result.status === "ok" ? "added" : "error");
    });
  }

  return (
    <div className="flex items-center gap-3" data-testid="add-to-review">
      <Button
        type="button"
        variant="secondary"
        onClick={add}
        disabled={isPending || state === "added"}
        data-testid="add-to-review-button"
      >
        {state === "added" ? "Added to review" : "Add to review"}
      </Button>
      {state === "error" ? (
        <span className="text-sm font-semibold text-rose-700" role="alert">
          Could not add to review. Please try again.
        </span>
      ) : null}
    </div>
  );
}
