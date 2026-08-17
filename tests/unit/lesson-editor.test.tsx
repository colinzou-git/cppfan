import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CURRENT_LESSON_SCHEMA_VERSION,
  type LessonPayload
} from "@/features/user-content/user-content-types";

const mocks = vi.hoisted(() => ({
  publish: vi.fn(),
  reset: vi.fn(),
  save: vi.fn()
}));

vi.mock("@/features/user-content/user-content-actions", () => ({
  publishContent: mocks.publish,
  resetReviewForContent: mocks.reset,
  saveLessonDraft: mocks.save
}));

vi.mock("@/features/user-content/attachment-manager", () => ({
  AttachmentManager: () => null
}));

vi.mock("@/features/user-content/version-history", () => ({
  VersionHistory: () => null
}));

import { LessonEditor } from "@/features/user-content/lesson-editor";

const payload: LessonPayload = {
  schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
  itemType: "lesson",
  title: "Pointers",
  content: "Core lesson",
  explanation: "Why it matters"
};

function saved(contentId = "c1", revision = 2) {
  return {
    status: "ok" as const,
    contentId,
    draftVersionId: `draft-${revision}`,
    revision,
    savedAt: new Date(0).toISOString()
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  mocks.save.mockResolvedValue(saved());
  mocks.publish.mockResolvedValue({
    status: "ok",
    contentId: "c1",
    skillId: "user.skill.c1",
    learningItemId: "user.item.c1",
    versionNumber: 1
  });
  mocks.reset.mockResolvedValue({ status: "ok" });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("LessonEditor serialized persistence", () => {
  it("does not let the pending autosave duplicate a manual save", async () => {
    vi.useFakeTimers();
    render(<LessonEditor initialContentId="c1" initialRevision={1} initialPayload={payload} />);

    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "Pointers updated" }
    });
    act(() => vi.advanceTimersByTime(1000));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save draft/i }));
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mocks.save).toHaveBeenCalledTimes(1);
  });

  it("stops publishing when the prerequisite draft flush fails", async () => {
    mocks.save.mockResolvedValue({ status: "error" });
    render(<LessonEditor initialContentId="c1" initialRevision={1} initialPayload={payload} />);
    fireEvent.change(screen.getByPlaceholderText("Teach the concept…"), {
      target: { value: "Unsaved change" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText(/Could not save\. Try again/i)).toBeTruthy();
    expect(mocks.publish).not.toHaveBeenCalled();
  });

  it("publishes a new lesson with the content id and revision returned by its first save", async () => {
    mocks.save.mockResolvedValue(saved("new-content", 1));
    render(<LessonEditor />);
    fireEvent.change(screen.getByPlaceholderText("Lesson title"), {
      target: { value: "New lesson" }
    });
    fireEvent.change(screen.getByPlaceholderText("Teach the concept…"), {
      target: { value: "Teach it" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Why it matters/i), {
      target: { value: "Explain it" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText("Published.")).toBeTruthy();
    expect(mocks.publish).toHaveBeenCalledWith({
      contentId: "new-content",
      expectedRevision: 1
    });
  });

  it("saves AI objectives and common mistakes instead of dropping them", async () => {
    const proposal = {
      summary: "Structured additions",
      operations: [
        {
          id: "op-0",
          type: "set_objectives",
          value: ["Use pointers safely"]
        },
        {
          id: "op-1",
          type: "append_section",
          section: "commonMistakes",
          value: "Do not dereference null."
        }
      ]
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ proposal }) })
    );
    render(<LessonEditor initialContentId="c1" initialRevision={1} initialPayload={payload} />);

    fireEvent.change(screen.getByPlaceholderText(/common-mistakes section/i), {
      target: { value: "Add objectives and common mistakes" }
    });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    await screen.findByText(/Set 1 learning objective/i);
    fireEvent.click(screen.getByRole("button", { name: /apply selected/i }));
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0][0].payload).toMatchObject({
      learningObjectives: ["Use pointers safely"],
      sections: { commonMistakes: "Do not dereference null." }
    });
  });

  it("flushes the latest dirty draft before asking the AI endpoint", async () => {
    const pending = deferred<ReturnType<typeof saved>>();
    mocks.save.mockReturnValueOnce(pending.promise);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        proposal: {
          summary: "s",
          operations: [{ id: "op-0", type: "replace_field", field: "title", value: "New" }]
        }
      })
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<LessonEditor initialContentId="c1" initialRevision={1} initialPayload={payload} />);

    fireEvent.change(screen.getByPlaceholderText("Teach the concept…"), {
      target: { value: "Latest unsaved lesson" }
    });
    fireEvent.change(screen.getByPlaceholderText(/common-mistakes section/i), {
      target: { value: "Improve it" }
    });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.save.mock.calls[0][0].payload).toMatchObject({
      content: "Latest unsaved lesson"
    });

    await act(async () => {
      pending.resolve(saved("c1", 2));
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});
