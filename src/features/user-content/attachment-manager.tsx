"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordFileAttachment, removeAttachment, setAttachmentVisibility } from "./user-content-actions";
import { buildAttachmentPath, validateAttachmentUpload } from "./attachment-upload";
import type { UserContentAttachment } from "./user-content-queries";
import type { AttachmentVisibility } from "./user-content-types";

const BUCKET = "user-content-attachments";
const FILE_KINDS = new Set(["file", "image", "pdf"]);

/**
 * Editor attachment manager for uploaded files/images/PDFs (#487). The client
 * validates, uploads bytes to the private Storage bucket under the owner path,
 * then records metadata via the ownership-checked add_file_attachment RPC.
 * Downloads use short-lived signed URLs — the bucket is private. Author-source
 * is the default; learner-resource attachments show on the published page.
 */
export function AttachmentManager({
  contentId,
  initialAttachments
}: {
  contentId?: string;
  initialAttachments: UserContentAttachment[];
}) {
  const router = useRouter();
  const [attachments, setAttachments] = useState(initialAttachments.filter((a) => FILE_KINDS.has(a.kind)));
  const [visibility, setVisibility] = useState<AttachmentVisibility>("author_source");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !contentId) {
      return;
    }
    const check = validateAttachmentUpload({ mimeType: file.type, sizeBytes: file.size });
    if (!check.ok) {
      setMessage(check.reason);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setMessage("File uploads need a configured backend.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) {
        setMessage("Sign in to upload files.");
        return;
      }
      const attId = crypto.randomUUID();
      const path = buildAttachmentPath(uid, contentId, attId, file.name);
      const uploaded = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (uploaded.error) {
        setMessage("Upload failed. Try again.");
        return;
      }
      const recorded = await recordFileAttachment({
        contentId,
        kind: check.kind,
        visibility,
        storagePath: path,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size
      });
      if (recorded.status !== "ok") {
        await supabase.storage.from(BUCKET).remove([path]);
        setMessage(recorded.status === "invalid" ? "That file was rejected." : "Could not save the attachment.");
        return;
      }
      setAttachments((prev) => [
        ...prev,
        {
          id: recorded.attachmentId,
          contentItemId: contentId,
          kind: check.kind,
          visibility,
          externalUrl: null,
          referencedLearningItemId: null,
          storagePath: path,
          filename: file.name,
          createdAt: new Date().toISOString()
        }
      ]);
      setMessage("Uploaded.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function download(att: UserContentAttachment) {
    const supabase = createClient();
    if (!supabase || !att.storagePath) {
      return;
    }
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(att.storagePath, 300);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener");
    }
  }

  async function toggle(att: UserContentAttachment) {
    const next: AttachmentVisibility = att.visibility === "author_source" ? "learner_resource" : "author_source";
    const result = await setAttachmentVisibility(att.id, next);
    if (result.status === "ok") {
      setAttachments((prev) => prev.map((a) => (a.id === att.id ? { ...a, visibility: next } : a)));
    }
  }

  async function remove(att: UserContentAttachment) {
    const result = await removeAttachment(att.id);
    if (result.status === "ok") {
      const supabase = createClient();
      if (supabase && att.storagePath) {
        await supabase.storage.from(BUCKET).remove([att.storagePath]);
      }
      setAttachments((prev) => prev.filter((a) => a.id !== att.id));
      router.refresh();
    }
  }

  const btn = "rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50";

  return (
    <div className="grid gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
      <div className="text-sm font-bold text-sky-900">Attachments</div>
      {!contentId ? (
        <p className="text-sm text-slate-600">Save the lesson to attach files.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Visibility
              <select
                className="ml-2 rounded-lg border border-slate-300 px-2 py-1 font-normal"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as AttachmentVisibility)}
              >
                <option value="author_source">Author only</option>
                <option value="learner_resource">Show to learners</option>
              </select>
            </label>
            <label className={`${btn} cursor-pointer`}>
              {busy ? "Uploading…" : "Add file"}
              <input type="file" className="hidden" disabled={busy} onChange={onFile} aria-label="Add file" />
            </label>
            {message ? <span className="text-xs font-semibold text-slate-600">{message}</span> : null}
          </div>

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-500">No files yet. Images, PDFs, and text up to 25 MiB.</p>
          ) : (
            <ul className="grid gap-1.5">
              {attachments.map((att) => (
                <li key={att.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm">
                  <span className="min-w-0 truncate font-semibold text-slate-800">
                    {att.filename || "file"} <span className="font-normal text-slate-400">· {att.kind} · {att.visibility === "learner_resource" ? "learner" : "author"}</span>
                  </span>
                  <span className="flex gap-2">
                    <button type="button" className={btn} onClick={() => void download(att)}>Download</button>
                    <button type="button" className={btn} onClick={() => void toggle(att)}>
                      {att.visibility === "author_source" ? "Show to learners" : "Make author-only"}
                    </button>
                    <button type="button" className={`${btn} border-rose-200 text-rose-700`} onClick={() => void remove(att)}>Remove</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
