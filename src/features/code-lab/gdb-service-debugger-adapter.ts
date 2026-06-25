import type {
  CodeDebugActionRequest,
  CodeDebugSnapshot,
  CodeDebugStartRequest,
  CodeDebugStopRequest,
  CodeDebuggerHealth
} from "./code-debug-types";
import type { CodeDebuggerAdapter } from "./code-debugger-adapter";

/**
 * Adapter for the OVH GDB/MI debugger service (#442). The browser never reaches
 * this service directly and never receives CODE_DEBUGGER_API_KEY — the Next.js
 * routes proxy here server-side. The service itself (services/gdb-debugger) lands
 * in a later slice; this adapter is the transport contract for it.
 */
export type GdbServiceAdapterConfig = {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 300_000;

export class GdbServiceDebuggerAdapter implements CodeDebuggerAdapter {
  readonly name = "gdb-service";
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: GdbServiceAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  start(input: CodeDebugStartRequest): Promise<CodeDebugSnapshot> {
    return this.post<CodeDebugSnapshot>("/debug/start", input);
  }

  action(input: CodeDebugActionRequest): Promise<CodeDebugSnapshot> {
    return this.post<CodeDebugSnapshot>("/debug/action", input);
  }

  stop(input: CodeDebugStopRequest): Promise<{ ok: boolean }> {
    return this.post<{ ok: boolean }>("/debug/stop", input);
  }

  async health(): Promise<CodeDebuggerHealth> {
    try {
      const res = await this.fetchWithTimeout("/health", { method: "GET" });
      if (!res.ok) {
        return { status: "error", provider: this.name, message: `Debugger health ${res.status}.` };
      }
      return { status: "ok", provider: this.name };
    } catch (error) {
      return {
        status: "error",
        provider: this.name,
        message: error instanceof Error ? error.message : "Debugger unreachable."
      };
    }
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchWithTimeout(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`Debugger service responded ${res.status}.`);
    }
    return (await res.json()) as T;
  }

  private fetchWithTimeout(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers = new Headers(init.headers);
    // Server-only secret: it travels from the Next.js route to the OVH service
    // and is never returned to the browser.
    if (this.apiKey) headers.set("authorization", `Bearer ${this.apiKey}`);
    return fetch(`${this.baseUrl}${path}`, { ...init, headers, signal: controller.signal }).finally(
      () => clearTimeout(timer)
    );
  }
}
