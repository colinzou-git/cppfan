import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { hoisted } = vi.hoisted(() => ({
  hoisted: {
    refresh: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    createSignedUrl: vi.fn(),
    getUser: vi.fn(),
    recordFileAttachment: vi.fn(),
    setAttachmentVisibility: vi.fn(),
    removeAttachment: vi.fn(),
    client: null as unknown
  }
}));

hoisted.client = {
  auth: { getUser: hoisted.getUser },
  storage: { from: () => ({ upload: hoisted.upload, remove: hoisted.remove, createSignedUrl: hoisted.createSignedUrl }) }
};

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: hoisted.refresh }) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => hoisted.client }));
vi.mock("@/features/user-content/user-content-actions", () => ({
  recordFileAttachment: hoisted.recordFileAttachment,
  setAttachmentVisibility: hoisted.setAttachmentVisibility,
  removeAttachment: hoisted.removeAttachment
}));

import { AttachmentManager } from "@/features/user-content/attachment-manager";

afterEach(() => vi.clearAllMocks());

describe("AttachmentManager (#487)", () => {
  it("prompts to save a draft first when there is no content id", () => {
    render(<AttachmentManager initialAttachments={[]} />);
    expect(screen.getByText(/save the lesson to attach files/i)).toBeTruthy();
  });

  it("rejects an unsupported file type before uploading", async () => {
    render(<AttachmentManager contentId="c1" initialAttachments={[]} />);
    const file = new File(["zip-bytes"], "archive.zip", { type: "application/zip" });
    fireEvent.change(screen.getByLabelText("Add file"), { target: { files: [file] } });
    expect(await screen.findByText(/unsupported file type/i)).toBeTruthy();
    expect(hoisted.upload).not.toHaveBeenCalled();
    expect(hoisted.recordFileAttachment).not.toHaveBeenCalled();
  });

  it("uploads a valid image, records metadata, and lists it", async () => {
    hoisted.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    hoisted.upload.mockResolvedValue({ error: null });
    hoisted.recordFileAttachment.mockResolvedValue({ status: "ok", attachmentId: "att-1" });

    render(<AttachmentManager contentId="c1" initialAttachments={[]} />);
    const file = new File(["png"], "diagram.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Add file"), { target: { files: [file] } });

    await waitFor(() => expect(hoisted.upload).toHaveBeenCalled());
    await waitFor(() =>
      expect(hoisted.recordFileAttachment).toHaveBeenCalledWith(
        expect.objectContaining({ contentId: "c1", kind: "image", filename: "diagram.png", mimeType: "image/png" })
      )
    );
    // the uploaded object path is owner + content namespaced
    const path = hoisted.upload.mock.calls[0][0] as string;
    expect(path.startsWith("u1/c1/")).toBe(true);
    expect(await screen.findByText(/diagram\.png/i)).toBeTruthy();
  });
});
