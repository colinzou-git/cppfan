import type { CodeTerminalAdapter } from "./code-terminal-adapter";
import { sharedMockTerminalAdapter } from "./code-terminal-adapter";
import { GdbServiceTerminalAdapter } from "./gdb-service-terminal-adapter";

/**
 * Provider selection for the Code Lab interactive Terminal (#664). Server-only —
 * reads CODE_TERMINAL_* env. Selection rules:
 *
 * - `execution-service` with a base URL → the real OVH terminal adapter.
 * - `mock` → the deterministic in-memory mock.
 * - unset/misconfigured → the mock in non-production (so local dev, CI, and
 *   Playwright work offline), but an explicit "unconfigured" state in production
 *   so a real deployment never pretends live input works.
 *
 * The mock is a shared singleton so its sessions survive across the stateless
 * start/poll/input/stop route handlers.
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

  if (process.env.NODE_ENV === "production") {
    return { kind: "unconfigured", note: "Real terminal service is not configured." };
  }

  // Local dev / CI / Playwright default: deterministic offline mock.
  return { kind: "ready", adapter: sharedMockTerminalAdapter };
}
