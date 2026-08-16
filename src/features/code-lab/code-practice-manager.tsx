"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CodePracticeController } from "./use-code-practices";

export function CodePracticeManager({
  controller: p,
  referenceLocked = false
}: {
  controller: CodePracticeController;
  /** Do not enter a reference view while a Terminal/debug session is active. */
  referenceLocked?: boolean;
}) {
  const [dialog, setDialog] = useState<"create" | "rename" | "delete" | null>(null);
  const [name, setName] = useState("");

  if (p.loadState === "disabled") return null;

  if (p.loadState === "signed_out") {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
        data-testid="code-practice-signed-out"
      >
        <span className="font-bold">My Practice Code</span>
        <span className="ml-2">Sign in to save named practices across devices.</span>{" "}
        <Link href="/login" className="font-bold text-blue-700 hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  const openCreate = () => {
    setName(p.suggestedName);
    setDialog("create");
  };
  const openRename = () => {
    setName(p.activePractice?.name ?? "");
    setDialog("rename");
  };

  return (
    <div
      className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
      data-testid="code-practice-manager"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">My Practice Code</p>
          <p className="text-sm font-bold text-slate-900" data-testid="code-practice-active-name">
            {p.activePractice ? p.activePractice.name : "Working draft"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.activePractice ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => void p.saveActive()}
                disabled={!p.practiceDirty || p.busy !== null || p.readOnlyReference}
                data-testid="code-practice-save"
              >
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={openCreate}
                disabled={p.busy !== null || p.readOnlyReference}
              >
                Save as New Practice
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={openRename}
                disabled={p.busy !== null}
              >
                Rename
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDialog("delete")}
                disabled={p.busy !== null}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={openCreate}
              disabled={p.busy !== null || p.loadState !== "ready" || p.readOnlyReference}
              data-testid="code-practice-create"
            >
              Save Practice
            </Button>
          )}
        </div>
      </div>

      {p.loadState === "loading" ? <p className="text-xs text-slate-500">Loading saved practices…</p> : null}
      {p.practiceDirty ? (
        <p className="text-xs font-bold text-amber-700" data-testid="code-practice-dirty">
          Unsaved practice changes
        </p>
      ) : null}
      {p.error ? (
        <p className="text-xs font-bold text-rose-700" role="alert">
          {p.error}
        </p>
      ) : null}

      {p.loadState === "ready" ? (
        <div className="flex flex-wrap gap-2" aria-label="Code source view">
          <button
            type="button"
            onClick={() => p.chooseReferenceMode("learner")}
            className={sourceTabClass(p.referenceMode === "learner")}
            data-testid="code-practice-view-learner"
          >
            {p.activePractice ? "My Practice" : "Working Draft"}
          </button>
          <button
            type="button"
            onClick={() => p.chooseReferenceMode("current_standard")}
            disabled={referenceLocked}
            title={referenceLocked ? "Stop the running/debug session before viewing reference code." : undefined}
            className={sourceTabClass(p.referenceMode === "current_standard")}
            data-testid="code-practice-view-current"
          >
            cppFan Sample (current)
          </button>
          {p.historicalAvailable ? (
            <button
              type="button"
              onClick={() => p.chooseReferenceMode("saved_standard")}
              disabled={referenceLocked}
              title={referenceLocked ? "Stop the running/debug session before viewing reference code." : undefined}
              className={sourceTabClass(p.referenceMode === "saved_standard")}
              data-testid="code-practice-view-saved"
            >
              cppFan Sample (when saved)
            </button>
          ) : null}
        </div>
      ) : null}

      {p.readOnlyReference ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
          data-testid="code-practice-reference-message"
        >
          Reference view is read-only. Switch back to {p.activePractice ? "My Practice" : "Working Draft"} to edit or run code.
        </p>
      ) : null}

      {p.practices.length > 0 ? (
        <div className="grid gap-1.5" data-testid="code-practice-list">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Saved practices</p>
            {p.activePractice ? (
              <button
                type="button"
                onClick={p.requestWorkingDraft}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Return to working draft
              </button>
            ) : null}
          </div>
          {p.practices.map((practice) => (
            <div
              key={practice.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{practice.name}</p>
                <p className="text-[11px] text-slate-500">Updated {formatDate(practice.updatedAt)}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={practice.id === p.activePracticeId ? "secondary" : "ghost"}
                onClick={() => p.requestOpenPractice(practice.id)}
                disabled={p.busy !== null}
                data-testid={`code-practice-open-${practice.id}`}
              >
                {practice.id === p.activePracticeId ? "Open" : "Open"}
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {dialog === "create" || dialog === "rename" ? (
        <PracticeDialog
          title={dialog === "create" ? "Save practice" : "Rename practice"}
          name={name}
          setName={setName}
          confirmLabel={dialog === "create" ? "Save Practice" : "Rename"}
          busy={p.busy !== null}
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            const trimmed = name.trim();
            if (!trimmed) return;
            const ok =
              dialog === "create" ? await p.createPractice(trimmed) : await p.renameActive(trimmed);
            if (ok) setDialog(null);
          }}
        />
      ) : null}

      {dialog === "delete" && p.activePractice ? (
        <ConfirmDialog
          title="Delete saved practice?"
          description={`Delete “${p.activePractice.name}”? The code currently in the editor will remain as your working draft.`}
          confirmLabel="Delete"
          busy={p.busy !== null}
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            const ok = await p.deletePractice(p.activePractice!.id);
            if (ok) setDialog(null);
          }}
        />
      ) : null}

      {p.pendingSwitch ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Unsaved practice changes"
          data-testid="code-practice-switch-dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-slate-900">Save practice changes?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This named practice has changes that are not saved to the practice snapshot.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => void p.resolvePendingSwitch("cancel")}>Cancel</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => void p.resolvePendingSwitch("discard")}>Discard changes</Button>
              <Button type="button" size="sm" onClick={() => void p.resolvePendingSwitch("save")} disabled={p.busy !== null}>Save changes</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function sourceTabClass(active: boolean): string {
  return `rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
    active
      ? "border-blue-300 bg-blue-50 text-blue-800"
      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
  }`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PracticeDialog({
  title,
  name,
  setName,
  confirmLabel,
  busy,
  onCancel,
  onConfirm
}: {
  title: string;
  name: string;
  setName: (value: string) => void;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/30 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <label className="mt-3 grid gap-1 text-sm font-semibold text-slate-700">
          Practice name
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            className="rounded-xl border border-slate-300 px-3 py-2 font-normal"
            data-testid="code-practice-name-input"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" size="sm" onClick={() => void onConfirm()} disabled={busy || name.trim().length === 0}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/30 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" size="sm" onClick={() => void onConfirm()} disabled={busy}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
