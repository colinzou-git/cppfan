/**
 * Pure helpers for user-content file uploads (#487): the MIME allowlist and
 * size cap (mirroring the Storage bucket), owner-namespaced path construction,
 * filename sanitisation, and upload validation. Kept I/O-free so the rules are
 * unit-tested independently of the Supabase Storage client.
 */

/** Must match the bucket's allowed_mime_types in the Storage migration. */
export const ATTACHMENT_MIME_ALLOWLIST = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown"
] as const;

/** 25 MiB, matching the bucket's file_size_limit. */
export const MAX_ATTACHMENT_BYTES = 26214400;

export type FileAttachmentKind = "image" | "pdf" | "file";

/** Map a MIME type to the attachment_kind the RPC expects, or null if unsupported. */
export function attachmentKindForMime(mimeType: string): FileAttachmentKind | null {
  if (!(ATTACHMENT_MIME_ALLOWLIST as readonly string[]).includes(mimeType)) {
    return null;
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType === "application/pdf") {
    return "pdf";
  }
  return "file";
}

/**
 * Make a filename safe for a Storage object path: keep only a conservative set
 * of characters, collapse whitespace, drop leading dots, and cap the length.
 * Never empty.
 */
export function sanitizeFilename(name: string): string {
  const base = (name ?? "").split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/[^A-Za-z0-9._ -]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 128)
    .trim();
  return cleaned.length > 0 ? cleaned : "attachment";
}

/**
 * Owner-namespaced object path: <uid>/<contentId>/<attachmentId>/<safe-filename>.
 * The first two segments are what the Storage RLS and add_file_attachment RPC
 * verify, so they must be the raw uid and content id.
 */
export function buildAttachmentPath(
  userId: string,
  contentId: string,
  attachmentId: string,
  filename: string
): string {
  return `${userId}/${contentId}/${attachmentId}/${sanitizeFilename(filename)}`;
}

export type UploadValidation = { ok: true; kind: FileAttachmentKind } | { ok: false; reason: string };

/** Validate a candidate upload against the MIME allowlist and size cap. */
export function validateAttachmentUpload(input: { mimeType: string; sizeBytes: number }): UploadValidation {
  const kind = attachmentKindForMime(input.mimeType);
  if (!kind) {
    return { ok: false, reason: "Unsupported file type. Allowed: images, PDF, plain text, Markdown." };
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    return { ok: false, reason: "The file appears to be empty." };
  }
  if (input.sizeBytes > MAX_ATTACHMENT_BYTES) {
    return { ok: false, reason: "File is too large (max 25 MiB)." };
  }
  return { ok: true, kind };
}
