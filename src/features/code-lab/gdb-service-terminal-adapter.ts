import type {
  CodeTerminalHealth,
  CodeTerminalInputRequest,
  CodeTerminalPollRequest,
  CodeTerminalSnapshot,
  CodeTerminalStartRequest,
  CodeTerminalStopRequest
} from "./code-terminal-types";
import type { CodeTerminalAdapter } from "./code-terminal-adapter";

/**
 * Adapter for the OVH execution service's terminal routes (#664). The browser
 * never reaches this service directly and never receives CODE_TERMINAL_API_KEY —
 * the Next.js terminal routes proxy here server-side. It reuses the same OVH
 * deployable as the GDB debugger but keeps a terminal-specific transport so the
 * one-shot runner and debug contracts stay separate.
 */
export type TerminalServiceAdapterConfig = {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

export class GdbServiceTerminalAdapter implements CodeTerminalAdapter {
  readonly name = "execution-service";
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: TerminalServiceAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  start(input: CodeTerminalStartRequest): Promise<CodeTerminalSnapshot> {
    // Only source + Input Args cross to the service; item metadata stays app-side.
    return this.post<CodeTerminalSnapshot>("/terminal/start", {
      itemId: input.itemId,
      source: input.source,
      stdin: input.stdin ?? ""
    });
  }

  poll(input: CodeTerminalPollRequest): Promise<CodeTerminalSnapshot> {
    return this.post<CodeTerminalSnapshot>("/terminal/poll", {
      sessionId: input.sessionId,
      sessionToken: input.sessionToken,
      after: input.after
    });
  }

  input(input: CodeTerminalInputRequest): Promise<{ ok: boolean }> {
    return this.post<{ ok: boolean }>("/terminal/input", {
      sessionId: input.sessionId,
      sessionToken: input.sessionToken,
      data: input.data,
      eof: input.eof ?? false
    });
  }

  stop(input: CodeTerminalStopRequest): Promise<{ ok: boolean }> {
    return this.post<{ ok: boolean }>("/terminal/stop", {
      sessionId: input.sessionId,
      sessionToken: input.sessionToken
    });
  }

  async health(): Promise<CodeTerminalHealth> {
    try {
      const res = await this.fetchWithTimeout("/health", { method: "GET" });
      if (!res.ok) {
        return { status: "error", provider: this.name, message: `Terminal health ${res.status}.` };
      }
      return { status: "ok", provider: this.name };
    } catch (error) {
      return {
        status: "error",
        provider: this.name,
        message: error instanceof Error ? error.message : "Terminal service unreachable."
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
      throw new Error(`Terminal service responded ${res.status}.`);
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
