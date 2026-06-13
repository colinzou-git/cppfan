"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExplanationPanel } from "./explanation-panel";

/*
 * Explicit give-up/reveal control for graded items that have no submit flow of
 * their own (code_reading / concept_check / bug_spotting items without choices).
 * The answer-bearing explanation stays hidden until the learner chooses to
 * reveal it, then is announced via an aria-live region (#145).
 */
export function RevealExplanation({ explanation }: { explanation: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="grid gap-3" data-testid="reveal-explanation">
      {revealed ? (
        <div aria-live="polite">
          <ExplanationPanel explanation={explanation} />
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setRevealed(true)}
          data-testid="reveal-explanation-button"
        >
          Reveal explanation
        </Button>
      )}
    </div>
  );
}
