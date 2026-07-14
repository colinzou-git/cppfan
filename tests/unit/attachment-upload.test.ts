import { describe, expect, it } from "vitest";
import {
  MAX_ATTACHMENT_BYTES,
  attachmentKindForMime,
  buildAttachmentPath,
  sanitizeFilename,
  validateAttachmentUpload
} from "@/features/user-content/attachment-upload";

describe("attachment-upload helpers (#487)", () => {
  it("maps MIME types to attachment kinds and rejects unsupported ones", () => {
    expect(attachmentKindForMime("image/png")).toBe("image");
    expect(attachmentKindForMime("application/pdf")).toBe("pdf");
    expect(attachmentKindForMime("text/markdown")).toBe("file");
    expect(attachmentKindForMime("application/x-msdownload")).toBeNull();
  });

  it("sanitises filenames without dropping legitimate characters", () => {
    expect(sanitizeFilename("my diagram 1.png")).toBe("my diagram 1.png");
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("weird<>:name?.txt")).toBe("weirdname.txt");
    expect(sanitizeFilename("")).toBe("attachment");
    expect(sanitizeFilename("...")).toBe("attachment");
  });

  it("builds an owner-namespaced storage path with the raw uid and content id first", () => {
    const path = buildAttachmentPath("u-1", "c-1", "a-1", "../x/Photo 2.png");
    expect(path).toBe("u-1/c-1/a-1/Photo 2.png");
    expect(path.split("/")[0]).toBe("u-1");
    expect(path.split("/")[1]).toBe("c-1");
  });

  it("validates uploads against the allowlist and size cap", () => {
    expect(validateAttachmentUpload({ mimeType: "image/png", sizeBytes: 1000 })).toEqual({ ok: true, kind: "image" });
    expect(validateAttachmentUpload({ mimeType: "application/zip", sizeBytes: 10 }).ok).toBe(false);
    expect(validateAttachmentUpload({ mimeType: "image/png", sizeBytes: 0 }).ok).toBe(false);
    expect(validateAttachmentUpload({ mimeType: "image/png", sizeBytes: MAX_ATTACHMENT_BYTES + 1 }).ok).toBe(false);
  });
});
