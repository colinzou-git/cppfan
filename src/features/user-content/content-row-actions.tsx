"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  archiveContent,
  exportContent,
  publishContent,
  publishExercise,
  restoreContent
} from "./user-content-actions";
import { DeleteContentDialog } from "./delete-content-dialog";
import { buildUserContentZip } from "./user-content-export";
import type { UserContentKind, UserContentLifecycle } from "./user-content-types";

const ERRORS: Record<string, string> = {
  conflict: "Changed on another device — reload first.",
  invalid: "Not ready: check required fields.",
  not_found: "That lesson was not found.",
  unconfigured: "Needs a configured backend.",
  error: "Something went wrong. Try again."
};

/**
 * Per-row lifecycle actions for a My Content item (#487). Publish/Archive/
 * Restore run the existing owner-scoped server actions and refresh the list;
 * Export downloads the portable JSON package (manifest + Markdown). Permanent
 * delete is intentionally handled by the dedicated delete-choice dialog.
 */
export function ContentRowActions({
  contentId,
  kind,
  status,
  revision
}: {
  contentId: string;
  kind: UserContentKind;
  status: UserContentLifecycle;
  revision: number;
}) {
  const router = useRouter();
  const base = kind === "exercise" ? "exercises" : "lessons";
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function run(action: () => Promise<{ status: string }>) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (result.status === "ok") {
        router.refresh();
      } else {
        setMessage(ERRORS[result.status] ?? ERRORS.error);
      }
    });
  }

  async function doExport() {
    setMessage("");
    const result = await exportContent(contentId);
    if (result.status !== "ok") {
      setMessage(ERRORS[result.status] ?? ERRORS.error);
      return;
    }
    const blob = new Blob([buildUserContentZip(result.export)], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cppfan-lesson-${contentId}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const btn = "rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/my-content/${base}/${contentId}/preview`} className={btn}>Preview</Link>
      {status === "draft" ? (
        <button
          type="button"
          className={btn}
          disabled={pending}
          onClick={() =>
            run(() =>
              kind === "exercise"
                ? publishExercise({ contentId, expectedRevision: revision })
                : publishContent({ contentId, expectedRevision: revision })
            )
          }
        >
          Publish
        </button>
      ) : null}
      {status === "draft" || status === "published" ? (
        <button type="button" className={btn} disabled={pending} onClick={() => run(() => archiveContent(contentId))}>
          Archive
        </button>
      ) : null}
      {status === "archived" ? (
        <button type="button" className={btn} disabled={pending} onClick={() => run(() => restoreContent(contentId))}>
          Restore
        </button>
      ) : null}
      <button type="button" className={btn} disabled={pending} onClick={() => void doExport()}>
        Export
      </button>
      <DeleteContentDialog contentId={contentId} onDeleted={() => router.refresh()} />
      {message ? <span className="text-xs font-semibold text-rose-700">{message}</span> : null}
    </div>
  );
}
