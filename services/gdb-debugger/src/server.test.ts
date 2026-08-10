import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const terminalMock = vi.hoisted(() => {
  let releaseStart: (() => void) | undefined;
  let markStartEntered: (() => void) | undefined;
  return {
    instances: [] as Array<{
      token: string;
      finished: boolean;
      finish(): void;
    }>,
    holdStart: new Promise<void>((resolve) => {
      releaseStart = resolve;
    }),
    startEntered: new Promise<void>((resolve) => {
      markStartEntered = resolve;
    }),
    releaseStart: () => releaseStart?.(),
    markStartEntered: () => markStartEntered?.()
  };
});

vi.mock("./terminal-session.js", () => ({
  TerminalSession: class TerminalSessionMock {
    finished = false;

    constructor(
      private readonly input: { source: string },
      readonly token: string
    ) {
      terminalMock.instances.push(this);
    }

    async start(): Promise<void> {
      if (this.input.source.includes("hold-start")) {
        terminalMock.markStartEntered();
        await terminalMock.holdStart;
      }
      if (this.input.source.includes("fail-start")) throw new Error("mock start failure");
    }

    snapshot() {
      return {
        status: this.finished ? "exited" : "running",
        events: [],
        nextSequence: 0,
        exitCode: this.finished ? 0 : undefined,
        durationMs: 1,
        outputTruncated: false
      };
    }

    get isFinished(): boolean {
      return this.finished;
    }

    get finishedAtMs(): number | null {
      return this.finished ? Date.now() : null;
    }

    get cumulativeInputChars(): number {
      return 0;
    }

    finish(): void {
      this.finished = true;
    }

    stop(): void {}
    async dispose(): Promise<void> {}
  }
}));

import { createDebuggerServer } from "./server.js";

const server = createDebuggerServer();
let baseUrl = "";

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

function start(source: string): Promise<Response> {
  return fetch(`${baseUrl}/terminal/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      source,
      stdin: "",
      files: [],
      compilerFlags: ["-std=c++20"]
    })
  });
}

async function stop(sessionId: string, sessionToken: string): Promise<Response> {
  return fetch(`${baseUrl}/terminal/stop`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, sessionToken })
  });
}

describe("single-user Terminal capacity (#664)", () => {
  it("allows exactly one compiling/running session and releases only after it finishes", async () => {
    const firstRequest = start("hold-start");
    await terminalMock.startEntered;

    const whileCompiling = await start("second");
    expect(whileCompiling.status).toBe(409);
    await expect(whileCompiling.json()).resolves.toEqual({
      error: {
        code: "terminal_busy",
        message: "The Terminal is busy. Stop or wait for the current run to finish."
      }
    });

    terminalMock.releaseStart();
    const first = await firstRequest;
    expect(first.status).toBe(200);
    const firstBody = await first.json();

    const whileRunning = await start("third");
    expect(whileRunning.status).toBe(409);

    await stop(firstBody.sessionId, firstBody.sessionToken);
    const whileStopping = await start("fourth");
    expect(whileStopping.status).toBe(409);

    terminalMock.instances[0].finish();
    const afterStop = await start("after-stop");
    expect(afterStop.status).toBe(200);
    const afterStopBody = await afterStop.json();

    // A completed session remains pollable for its transcript but no longer
    // consumes the singleton capacity.
    terminalMock.instances[1].finish();
    const afterNaturalExit = await start("after-natural-exit");
    expect(afterNaturalExit.status).toBe(200);
    const afterNaturalExitBody = await afterNaturalExit.json();
    terminalMock.instances[2].finish();

    const failedStart = await start("fail-start");
    expect(failedStart.status).toBe(500);
    const afterFailedStart = await start("after-failed-start");
    expect(afterFailedStart.status).toBe(200);
    const afterFailedStartBody = await afterFailedStart.json();

    terminalMock.instances[4].finish();
    await stop(afterStopBody.sessionId, afterStopBody.sessionToken);
    await stop(afterNaturalExitBody.sessionId, afterNaturalExitBody.sessionToken);
    await stop(afterFailedStartBody.sessionId, afterFailedStartBody.sessionToken);
  });
});
