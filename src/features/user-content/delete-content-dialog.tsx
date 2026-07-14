"use client";

import { useState } from "react";
import { deleteContent, type DeleteMode } from "./user-content-actions";

const ERRORS: Record<string, string> = {
  unconfigured: "Needs a configured backend.",
  error: "Something went wrong. Try again."
};

/**
 * Delete-choice dialog for a user lesson (#487). Permanent deletion of content
 * with history must ask what to do rather than silently cascading, so this
 * offers three explicit outcomes and gates the fully-destructive option behind
 * a second confirmation. Wraps the existing owner-scoped deleteContent action.
 */
export function DeleteContentDialog({
  contentId,
  onDeleted
}: {
  contentId: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setConfirmAll(false);
    setError("");
  }

  async function run(mode: DeleteMode) {
    setBusy(true);
    setError("");
    const result = await deleteContent(contentId, mode);
    setBusy(false);
    if (result.status === "ok") {
      close();
      onDeleted();
    } else {
      setError(ERRORS[result.status] ?? ERRORS.error);
    }
  }

  const btn = "rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50";
  const choice = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:border-slate-300 disabled:opacity-50";

  return (
    <>
      <button type="button" className={`${btn} border-rose-200 text-rose-700 hover:border-rose-300`} onClick={() => setOpen(true)}>
        Delete
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Delete lesson" className="relative z-10 grid w-full max-w-md gap-3 rounded-2xl border border-white/70 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-black text-slate-950">Delete this lesson?</h2>
            <p className="text-sm text-slate-600">Choose what happens to its learning history. This cannot be undone.</p>

            {confirmAll ? (
              <div className="grid gap-3">
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
                  This permanently deletes the lesson and all associated personal learning history (reviews, mastery, events). This is irreversible.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={`${btn} border-rose-300 bg-rose-600 text-white hover:bg-rose-700`} disabled={busy} onClick={() => void run("delete_all")}>
                    Permanently delete everything
                  </button>
                  <button type="button" className={btn} disabled={busy} onClick={() => setConfirmAll(false)}>
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <button type="button" className={choice} disabled={busy} onClick={() => void run("archive")}>
                  Archive instead <span className="font-normal text-slate-500">— keep everything, hide from learning</span>
                </button>
                <button type="button" className={choice} disabled={busy} onClick={() => void run("delete_editable")}>
                  Delete editable content <span className="font-normal text-slate-500">— keep history &amp; evidence for export/audit</span>
                </button>
                <button type="button" className={`${choice} border-rose-200 text-rose-700`} disabled={busy} onClick={() => setConfirmAll(true)}>
                  Delete everything <span className="font-normal text-rose-500">— including learning history</span>
                </button>
              </div>
            )}

            {error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
            <div className="flex justify-end">
              <button type="button" className={btn} disabled={busy} onClick={close}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
