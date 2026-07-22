import type { CodeTerminalAdapter } from "./code-terminal-adapter";
import { sharedMockTerminalAdapter } from "./code-terminal-adapter";
import { GdbServiceTerminalAdapter } from "./gdb-service-terminal-adapter";

/**
 * Provider selection for the Code Lab interactive Terminal (#664). Server-only —
 * reads CODE_TERMINAL_* env. Selection rules:
 *
 * - `execution-service` with a base URL → the real OVH terminal adapter.
 * - `mock` → the deterministic in-memory mock.
 * - unset/misconfigured → the mock everywhere EXCEPT a real production deployment
 *   (`VERCEL_ENV === "production"`), which shows an explicit "unconfigured" state so
 *   it never pretends live input works. CI/local/preview run a production Next build
 *   too (`next start`), so the gate is the hosting env, not NODE_ENV — otherwise the
 *   offline mock the Playwright suite relies on would never be selected.
 *
 * The mock's sessions live on globalThis so they survive across the separately
 * bundled start/poll/input/stop route handlers within one server process.
 */
export type TerminalSelection =
  | { kind: "ready"; adapter: CodeTerminalAdapter }
  | { kind: "unconfigured"; note: string };

export function selectTerminalProvider(): TerminalSelection {
  const provider = process.env.CODE_TERMINAL_PROVIDER?.trim().toLowerCase();

  if (provider === "execution-service") {
    const baseUrl = process.env.CODE_TERMINAL_BASE_URL?.trim();
    if (!baseUrl) {
      return { kind: "unconfigured", note: "CODE_TERMINAL_BASE_URL is not set." };
    }
    const timeoutMs = Number.parseInt(process.env.CODE_TERMINAL_TIMEOUT_MS ?? "", 10);
    return {
      kind: "ready",
      adapter: new GdbServiceTerminalAdapter({
        baseUrl,
        apiKey: process.env.CODE_TERMINAL_API_KEY?.trim(),
        timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined
      })
    };
  }

  if (provider === "mock") {
    return { kind: "ready", adapter: sharedMockTerminalAdapter };
  }

  // Only a real production deployment refuses to fall back to the mock.
  if (process.env.VERCEL_ENV === "production") {
    return { kind: "unconfigured", note: "Real terminal service is not configured." };
  }

  // Local dev / CI / Playwright / preview default: deterministic offline mock.
  return { kind: "ready", adapter: sharedMockTerminalAdapter };
}
