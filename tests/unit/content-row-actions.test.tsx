import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh, actions } = vi.hoisted(() => ({
  refresh: vi.fn(),
  actions: {
    publishContent: vi.fn(),
    publishExercise: vi.fn(),
    publishLab: vi.fn(),
    publishInterview: vi.fn(),
    archiveContent: vi.fn(),
    restoreContent: vi.fn(),
    exportContent: vi.fn()
  }
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/features/user-content/user-content-actions", () => actions);
// Keep the zip builder cheap so Export tests only assert the download filename.
vi.mock("@/features/user-content/user-content-export", () => ({ buildUserContentZip: () => new Uint8Array([1]) }));

import { ContentRowActions } from "@/features/user-content/content-row-actions";
import type { UserContentKind } from "@/features/user-content/user-content-types";

afterEach(() => {
  vi.clearAllMocks();
});

describe("ContentRowActions (#487)", () => {
  it("offers Publish/Archive/Export/Preview for a draft and refreshes after publishing", async () => {
    actions.publishContent.mockResolvedValue({ status: "ok" });
    render(<ContentRowActions contentId="c1" kind="lesson" status="draft" revision={3} />);

    expect(screen.getByRole("link", { name: /preview/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /archive/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /restore/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(actions.publishContent).toHaveBeenCalledWith({ contentId: "c1", expectedRevision: 3 }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("offers Restore (not Publish/Archive) for an archived item", () => {
    render(<ContentRowActions contentId="c2" kind="lesson" status="archived" revision={1} />);
    expect(screen.getByRole("button", { name: /restore/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /archive/i })).toBeNull();
  });

  it("surfaces an error message when an action fails", async () => {
    actions.archiveContent.mockResolvedValue({ status: "error" });
    render(<ContentRowActions contentId="c3" kind="lesson" status="published" revision={2} />);
    fireEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });

  // #606: every kind must route Preview/Publish/Export through its own contract.
  const cases: {
    kind: UserContentKind;
    publishKey: "publishContent" | "publishExercise" | "publishLab" | "publishInterview";
    preview: string;
    exportFile: string;
  }[] = [
    { kind: "lesson", publishKey: "publishContent", preview: "/my-content/lessons/x/preview", exportFile: "cppfan-lesson-x.zip" },
    { kind: "exercise", publishKey: "publishExercise", preview: "/my-content/exercises/x/preview", exportFile: "cppfan-exercise-x.zip" },
    { kind: "lab", publishKey: "publishLab", preview: "/my-content/labs/x/preview", exportFile: "cppfan-lab-x.zip" },
    {
      kind: "interview_problem",
      publishKey: "publishInterview",
      preview: "/my-content/interview/x/preview",
      exportFile: "cppfan-interview-problem-x.zip"
    }
  ];

  it.each(cases)("routes a $kind row to its own preview + publish action", async ({ kind, publishKey, preview }) => {
    actions[publishKey].mockResolvedValue({ status: "ok" });
    render(<ContentRowActions contentId="x" kind={kind} status="draft" revision={4} />);

    expect(screen.getByRole("link", { name: /preview/i }).getAttribute("href")).toBe(preview);

    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(actions[publishKey]).toHaveBeenCalledWith({ contentId: "x", expectedRevision: 4 }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());

    // No other publish action may fire for this kind.
    for (const other of ["publishContent", "publishExercise", "publishLab", "publishInterview"] as const) {
      if (other !== publishKey) expect(actions[other]).not.toHaveBeenCalled();
    }
  });

  it.each(cases)("downloads a $kind export with a kind-correct filename", async ({ kind, exportFile }) => {
    actions.exportContent.mockResolvedValue({ status: "ok", export: {} });
    render(<ContentRowActions contentId="x" kind={kind} status="draft" revision={1} />);

    // Install the anchor spy only after render, so React's own element creation
    // is untouched and only the export handler's createElement("a") is captured.
    const anchor = document.createElement("a");
    anchor.click = vi.fn();
    const realCreate = document.createElement.bind(document);
    const createEl = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => (tag === "a" ? anchor : realCreate(tag)));
    vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: vi.fn() });

    fireEvent.click(screen.getByRole("button", { name: /export/i }));

    await waitFor(() => expect(anchor.download).toBe(exportFile));
    createEl.mockRestore();
    vi.unstubAllGlobals();
  });
});
