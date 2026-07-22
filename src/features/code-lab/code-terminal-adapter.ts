import type {
  CodeTerminalEvent,
  CodeTerminalEventKind,
  CodeTerminalHealth,
  CodeTerminalInputRequest,
  CodeTerminalPollRequest,
  CodeTerminalSnapshot,
  CodeTerminalStartRequest,
  CodeTerminalStatus,
  CodeTerminalStopRequest
} from "./code-terminal-types";
import { isTerminalFinished } from "./code-terminal-types";

/**
 * A terminal backend (#664). The real implementation is the OVH execution-service
 * adapter; the interface keeps the routes provider-agnostic and lets the
 * deterministic mock below stand in for local dev, CI, and Playwright. Input
 * returns a bare ack — the poll loop is the single source of transcript events,
 * so a submitted line is never double-counted.
 */
export interface CodeTerminalAdapter {
  readonly name: string;
  start(input: CodeTerminalStartRequest): Promise<CodeTerminalSnapshot>;
  poll(input: CodeTerminalPollRequest): Promise<CodeTerminalSnapshot>;
  input(input: CodeTerminalInputRequest): Promise<{ ok: boolean }>;
  stop(input: CodeTerminalStopRequest): Promise<{ ok: boolean }>;
  health(): Promise<CodeTerminalHealth>;
}

export const TERMINAL_UNCONFIGURED_MESSAGE =
  "Interactive terminal service is not configured.";

/**
 * A successful, non-crashing snapshot for when no terminal provider is available
 * in a real deployment. The panel shows an explicit "not configured" state rather
 * than pretending live input works.
 */
export function unconfiguredTerminalSnapshot(
  message: string = TERMINAL_UNCONFIGURED_MESSAGE
): CodeTerminalSnapshot {
  return {
    sessionId: null,
    status: "unconfigured",
    events: [],
    nextSequence: 0,
    message
  };
}

type MockSession = {
  token: string;
  events: CodeTerminalEvent[];
  seq: number;
  status: CodeTerminalStatus;
  exitCode: number | null;
  startedAt: number;
};

/**
 * Deterministic, network-free terminal used by local dev, CI, and Playwright.
 * It does not compile or run C++ — it simulates a stable transcript so the whole
 * interactive workflow (start → live input → empty line → EOF/stop) is
 * exercisable offline. Sessions live in module scope, so a single server process
 * (dev/test) preserves them across the separate start/poll/input/stop requests.
 */
export class MockTerminalAdapter implements CodeTerminalAdapter {
  readonly name = "mock";
  private readonly sessions = new Map<string, MockSession>();
  private counter = 0;

  async start(input: CodeTerminalStartRequest): Promise<CodeTerminalSnapshot> {
    this.counter += 1;
    const sessionId = `mock-term-${this.counter}-${randomSuffix()}`;
    const token = `mock-token-${randomSuffix()}${randomSuffix()}`;
    const session: MockSession = {
      token,
      events: [],
      seq: 0,
      status: "running",
      exitCode: null,
      startedAt: Date.now()
    };
    this.sessions.set(sessionId, session);
    this.push(
      session,
      "system",
      "Simulated terminal — the interactive execution service is not configured, so this is a deterministic mock.\n"
    );
    if (input.stdin) this.push(session, "stdin", input.stdin);
    this.push(session, "stdout", "Program started. Type input and press Enter.\n");
    return this.snapshot(sessionId, session, 0);
  }

  async poll(input: CodeTerminalPollRequest): Promise<CodeTerminalSnapshot> {
    const session = this.owned(input.sessionId, input.sessionToken);
    if (!session) return unconfiguredTerminalSnapshot("This terminal session has ended.");
    return this.snapshot(input.sessionId, session, input.after);
  }

  async input(input: CodeTerminalInputRequest): Promise<{ ok: boolean }> {
    const session = this.owned(input.sessionId, input.sessionToken);
    if (!session || session.status !== "running") return { ok: false };
    if (input.eof) {
      this.push(session, "system", "\n[EOF sent]\n");
      this.push(session, "stdout", "Reached end of input.\n");
      session.status = "exited";
      session.exitCode = 0;
      this.push(session, "system", "\n[Program exited with code 0]");
      return { ok: true };
    }
    const data = input.data ?? "";
    // Echo the exact bytes, then a deterministic simulated response.
    this.push(session, "stdin", data);
    const trimmed = data.replace(/\r?\n$/, "");
    this.push(
      session,
      "stdout",
      trimmed.length > 0 ? `You entered: ${trimmed}\n` : "You entered an empty line.\n"
    );
    return { ok: true };
  }

  async stop(input: CodeTerminalStopRequest): Promise<{ ok: boolean }> {
    const session = this.owned(input.sessionId, input.sessionToken);
    if (session && session.status === "running") {
      session.status = "stopped";
      session.exitCode = null;
      this.push(session, "system", "\n[Program stopped by you]");
    }
    return { ok: true };
  }

  async health(): Promise<CodeTerminalHealth> {
    return { status: "ok", provider: this.name };
  }

  private owned(sessionId: string, token: string): MockSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || session.token !== token) return undefined;
    return session;
  }

  private push(session: MockSession, kind: CodeTerminalEventKind, text: string): void {
    session.seq += 1;
    session.events.push({ sequence: session.seq, kind, text, createdAt: new Date().toISOString() });
  }

  private snapshot(sessionId: string, session: MockSession, after: number): CodeTerminalSnapshot {
    return {
      sessionId,
      sessionToken: session.token,
      status: session.status,
      events: session.events.filter((event) => event.sequence > after),
      nextSequence: session.seq,
      exitCode: isTerminalFinished(session.status) ? session.exitCode : undefined,
      durationMs: Date.now() - session.startedAt,
      outputTruncated: false
    };
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

// One shared mock instance so state survives across the stateless route handlers
// within a single server process (dev/CI/Playwright).
export const sharedMockTerminalAdapter = new MockTerminalAdapter();
