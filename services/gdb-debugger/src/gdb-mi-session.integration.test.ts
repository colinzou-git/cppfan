import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { GdbSession } from "./gdb-mi-session";

/**
 * Real GDB regression coverage for #702. The debugger state machine depends on
 * GDB/MI async ordering, so parser-only tests cannot prove that a fast `*stopped`
 * event is not lost between the token result and the stop wait.
 */
function hasToolchain(): boolean {
  try {
    execSync("g++ --version", { stdio: "ignore" });
    execSync("gdb --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const runIf = hasToolchain() ? describe : describe.skip;

const SOURCE = `#include <iostream>
int main() {
  int x = 0;
  x += 1;
  x += 2;
  std::cout << x << "\\n";
  return 0;
}
`;

const NON_ZERO_SOURCE = `int main() {
  int code = 7;
  return code;
}
`;

async function within<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`debug action did not stop within ${timeoutMs}ms`)),
          timeoutMs
        );
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

runIf("GdbSession real-child integration (#702)", () => {
  it(
    "Continue consumes a fast breakpoint stop instead of waiting for the session wall timeout",
    async () => {
      const session = new GdbSession(SOURCE);
      try {
        const started = await within(session.start([5]));
        expect(started.status).toBe("paused");
        expect(started.line).not.toBeNull();

        const continued = await within(session.action("continue"));
        expect(continued.status).toBe("paused");
        expect(continued.line).toBe(5);
        expect(continued.reason).toMatch(/breakpoint/);
      } finally {
        await session.dispose();
      }
    },
    20_000
  );

  it(
    "Step Over advances promptly to a newer stop",
    async () => {
      const session = new GdbSession(SOURCE);
      try {
        const started = await within(session.start([]));
        expect(started.status).toBe("paused");
        expect(started.line).not.toBeNull();

        const stepped = await within(session.action("stepOver"));
        expect(stepped.status).toBe("paused");
        expect(stepped.line).not.toBeNull();
        expect(stepped.line).not.toBe(started.line);
      } finally {
        await session.dispose();
      }
    },
    20_000
  );

  it(
    "Continue to normal program completion returns an exited snapshot promptly",
    async () => {
      const session = new GdbSession(SOURCE);
      try {
        const started = await within(session.start([]));
        expect(started.status).toBe("paused");

        const exited = await within(session.action("continue"));
        expect(exited.status).toBe("exited");
        expect(exited.line).toBeNull();
        expect(exited.reason).toBe("exited-normally");
        // GDB 15 omits exit-code for the exited-normally (zero) record.
        expect(exited.exitCode).toBeNull();
        expect(exited.stack).toEqual([]);
        expect(exited.variables).toEqual([]);
      } finally {
        await session.dispose();
      }
    },
    20_000
  );

  it(
    "preserves a non-zero inferior exit code when GDB supplies it",
    async () => {
      const session = new GdbSession(NON_ZERO_SOURCE);
      try {
        const started = await within(session.start([]));
        expect(started.status).toBe("paused");

        const exited = await within(session.action("continue"));
        expect(exited.status).toBe("exited");
        expect(exited.reason).toBe("exited");
        expect(exited.exitCode).toBe(7);
      } finally {
        await session.dispose();
      }
    },
    20_000
  );
});
