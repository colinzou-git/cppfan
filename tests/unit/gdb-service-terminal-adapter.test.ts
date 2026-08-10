import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GdbServiceTerminalAdapter,
  TerminalServiceError
} from "@/features/code-lab/gdb-service-terminal-adapter";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GdbServiceTerminalAdapter errors (#664)", () => {
  it("retains the private service's safe busy code, status, and message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "terminal_busy",
              message: "The Terminal is busy. Stop or wait for the current run to finish."
            }
          }),
          { status: 409, headers: { "content-type": "application/json" } }
        )
      )
    );
    const adapter = new GdbServiceTerminalAdapter({ baseUrl: "http://terminal.test" });

    const failure = await adapter
      .start({ source: "int main(){}", stdin: "", files: [], compilerFlags: ["-std=c++20"] })
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(TerminalServiceError);
    expect(failure).toMatchObject({
      status: 409,
      code: "terminal_busy",
      message: "The Terminal is busy. Stop or wait for the current run to finish."
    });
  });

  it("uses a generic error when the service returns no safe JSON body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad gateway", { status: 502 })));
    const adapter = new GdbServiceTerminalAdapter({ baseUrl: "http://terminal.test" });

    await expect(
      adapter.start({ source: "x", stdin: "", files: [], compilerFlags: ["-std=c++20"] })
    ).rejects.toMatchObject({
      status: 502,
      code: "terminal_error",
      message: "Terminal service responded 502."
    });
  });
});
