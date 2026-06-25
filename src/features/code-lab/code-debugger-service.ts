import type { CodeDebuggerAdapter } from "./code-debugger-adapter";
import { GdbServiceDebuggerAdapter } from "./gdb-service-debugger-adapter";

/**
 * Provider selection for the Code Lab debugger (#442). Server-only — reads
 * CODE_DEBUGGER_* env. When unconfigured, the routes return a friendly
 * unconfigured snapshot rather than failing, so the Debug tab still works and CI
 * (which runs with CODE_DEBUGGER_PROVIDER unset) stays green.
 */
export type DebuggerSelection =
  | { kind: "ready"; adapter: CodeDebuggerAdapter }
  | { kind: "unconfigured"; note: string };

export function selectDebugger(): DebuggerSelection {
  const provider = process.env.CODE_DEBUGGER_PROVIDER?.trim().toLowerCase();
  if (!provider) {
    return { kind: "unconfigured", note: "Real debugger service is not configured." };
  }

  if (provider === "gdb-service") {
    const baseUrl = process.env.CODE_DEBUGGER_BASE_URL?.trim();
    if (!baseUrl) {
      return { kind: "unconfigured", note: "CODE_DEBUGGER_BASE_URL is not set." };
    }
    const timeoutMs = Number.parseInt(process.env.CODE_DEBUGGER_TIMEOUT_MS ?? "", 10);
    return {
      kind: "ready",
      adapter: new GdbServiceDebuggerAdapter({
        baseUrl,
        apiKey: process.env.CODE_DEBUGGER_API_KEY?.trim(),
        timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined
      })
    };
  }

  return { kind: "unconfigured", note: `Unknown debugger provider "${provider}".` };
}
