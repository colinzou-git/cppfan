"use client";

export type PublishMode = "continue" | "reset" | "new_version";

/**
 * Substantial-edit publish choice (#487). Shown when re-publishing an
 * already-published lesson: the owner picks how the FSRS schedule and history
 * should behave. Continue keeps the schedule; reset re-learns the material from
 * scratch; new version publishes a fresh version while prior history is
 * preserved (publishing always freezes an immutable snapshot).
 */
export function PublishChoiceDialog({
  open,
  busy,
  onChoose,
  onCancel
}: {
  open: boolean;
  busy: boolean;
  onChoose: (mode: PublishMode) => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }
  const choice = "grid w-full gap-0.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300 disabled:opacity-50";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Publish changes" className="relative z-10 grid w-full max-w-md gap-3 rounded-2xl border border-white/70 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-black text-slate-950">Publish your changes</h2>
        <p className="text-sm text-slate-600">This lesson is already published. Choose how its review schedule and history should behave.</p>
        <div className="grid gap-2">
          <button type="button" className={choice} disabled={busy} onClick={() => onChoose("continue")}>
            <span className="text-sm font-bold text-slate-900">Continue schedule</span>
            <span className="text-xs text-slate-500">Keep the existing FSRS review schedule.</span>
          </button>
          <button type="button" className={choice} disabled={busy} onClick={() => onChoose("new_version")}>
            <span className="text-sm font-bold text-slate-900">Publish as a new version</span>
            <span className="text-xs text-slate-500">Keep the schedule and preserve prior version history.</span>
          </button>
          <button type="button" className={`${choice} border-amber-200`} disabled={busy} onClick={() => onChoose("reset")}>
            <span className="text-sm font-bold text-amber-800">Reset review cards</span>
            <span className="text-xs text-amber-600">Re-learn this lesson from scratch (clears its FSRS schedule).</span>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
