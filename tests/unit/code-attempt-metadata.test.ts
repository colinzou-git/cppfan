import { describe, expect, it, vi } from "vitest";

// code-attempt-service imports the server supabase client at module load; stub it
// so the pure metadata helper can be imported in a node test.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => null) }));

import { codeAttemptMetadata } from "@/features/code-lab/code-attempt-service";

describe("codeAttemptMetadata content-version identity (#612)", () => {
  it("carries the immutable content version and milestone into the evidence metadata", () => {
    const meta = codeAttemptMetadata({
      itemId: "user.item.abc",
      test: { status: "ok", passed: 3, total: 3 } as never,
      contentVersionId: "ver-2",
      milestoneIndex: 1
    });
    expect(meta.contentVersionId).toBe("ver-2");
    expect(meta.milestoneIndex).toBe(1);
    expect(meta.itemId).toBe("user.item.abc");
  });

  it("defaults version/milestone to null for a native item with no version", () => {
    const meta = codeAttemptMetadata({ itemId: "cpp.native.lesson", run: { status: "success" } as never });
    expect(meta.contentVersionId).toBeNull();
    expect(meta.milestoneIndex).toBeNull();
  });
});
