import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { GdbSession } from "./gdb-mi-session.js";
import {
  DEBUG_LIMITS,
  TERMINAL_LIMITS,
  validateStartPayload,
  validateTerminalInput,
  validateTerminalStart
} from "./security.js";
import { SessionManager } from "./session-manager.js";
import { TerminalSession } from "./terminal-session.js";
import type {
  ActionBody,
  StartBody,
  StopBody,
  TerminalInputBody,
  TerminalPollBody,
  TerminalStartBody,
  TerminalStopBody
} from "./types.js";

/**
 * HTTP front of the GDB debugger service (#442). The Next.js app proxies here;
 * the browser never reaches it. POST routes require a bearer token equal to the
 * app's CODE_DEBUGGER_API_KEY. Sessions are in-memory and reaped on idle/wall
 * timeout. Run on the same OVH environment family as Judge0.
 *
 * Validated on the OVH deploy (it spawns g++/gdb), so treat the live behavior as
 * unverified until then; the routing/auth/session logic reuses unit-tested parts.
 */

const PORT = Number(process.env.PORT ?? 3008);
const API_KEY = process.env.DEBUGGER_API_KEY ?? process.env.CODE_DEBUGGER_API_KEY ?? "";

const sessions = new SessionManager<GdbSession>({
  sessionWallMs: DEBUG_LIMITS.sessionWallMs,
  idleTimeoutMs: DEBUG_LIMITS.idleTimeoutMs
});

// Interactive Terminal sessions (#664) use cryptographically random ids and a
// per-session capability token, so a browser-supplied id alone can never reach a
// foreign session.
const cryptoId = () => randomBytes(18).toString("base64url");
const terminals = new SessionManager<TerminalSession>(
  { sessionWallMs: TERMINAL_LIMITS.sessionWallMs, idleTimeoutMs: TERMINAL_LIMITS.idleTimeoutMs },
  cryptoId
);

function ownsTerminal(session: TerminalSession, token: unknown): boolean {
  const a = Buffer.from(session.token);
  const b = Buffer.from(typeof token === "string" ? token : "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(req: IncomingMessage): boolean {
  if (!API_KEY) return true; // dev / unconfigured: no key required
  const header = (req.headers["authorization"] as string | undefined) ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(token);
  const b = Buffer.from(API_KEY);
  return a.length === b.length && timingSafeEqual(a, b);
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > DEBUG_LIMITS.maxSourceChars * 2) throw new Error("payload too large");
    chunks.push(chunk as Buffer);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";
  if (req.method === "GET" && url === "/health") {
    return send(res, 200, { status: "ok", sessions: sessions.size, terminals: terminals.size });
  }
  if (req.method !== "POST")
    return send(res, 404, { error: { code: "not_found", message: "Not found." } });
  if (!authorized(req))
    return send(res, 401, { error: { code: "unauthorized", message: "Unauthorized." } });

  const body = await readJson(req);
  if (!body)
    return send(res, 400, { error: { code: "invalid_request", message: "Invalid JSON." } });

  if (url === "/debug/start") {
    const start = body as StartBody;
    const valid = validateStartPayload(start);
    if (!valid.ok) return send(res, 400, { error: { code: valid.code, message: valid.message } });
    const session = new GdbSession(valid.source);
    try {
      const snapshot = await session.start(valid.breakpointLines);
      const managed = sessions.create(session, Date.now());
      return send(res, 200, { ...snapshot, sessionId: managed.id });
    } catch (error) {
      await session.dispose();
      return send(res, 500, {
        error: {
          code: "start_failed",
          message: error instanceof Error ? error.message : "Start failed."
        }
      });
    }
  }

  if (url === "/debug/action") {
    const action = body as ActionBody;
    const session = action.sessionId ? sessions.get(action.sessionId) : undefined;
    if (!session || !action.sessionId) {
      return send(res, 404, { error: { code: "no_session", message: "Unknown session." } });
    }
    if (action.action === "restart") {
      return send(res, 409, {
        error: { code: "restart_unsupported", message: "Restart by starting a new session." }
      });
    }
    sessions.touch(action.sessionId, Date.now());
    const snapshot = await session.action(action.action ?? "continue", action.watches ?? []);
    return send(res, 200, { ...snapshot, sessionId: action.sessionId });
  }

  if (url === "/debug/stop") {
    const stop = body as StopBody;
    const session = stop.sessionId ? sessions.remove(stop.sessionId) : undefined;
    if (session) await session.dispose();
    return send(res, 200, { ok: true });
  }

  if (url === "/terminal/start") {
    const start = body as TerminalStartBody;
    const valid = validateTerminalStart(start);
    if (!valid.ok) return send(res, 400, { error: { code: valid.code, message: valid.message } });
    const token = randomBytes(24).toString("base64url");
    const session = new TerminalSession(
      {
        source: valid.source,
        initialStdin: valid.stdin,
        files: valid.files,
        compilerFlags: valid.compilerFlags
      },
      token
    );
    try {
      await session.start();
      const managed = terminals.create(session, Date.now());
      return send(res, 200, { ...session.snapshot(0), sessionId: managed.id, sessionToken: token });
    } catch (error) {
      await session.dispose();
      return send(res, 500, {
        error: {
          code: "start_failed",
          message: error instanceof Error ? error.message : "Start failed."
        }
      });
    }
  }

  if (url === "/terminal/poll") {
    const poll = body as TerminalPollBody;
    const session = poll.sessionId ? terminals.get(poll.sessionId) : undefined;
    if (!session || !ownsTerminal(session, poll.sessionToken)) {
      return send(res, 404, { error: { code: "no_session", message: "Unknown session." } });
    }
    terminals.touch(poll.sessionId!, Date.now());
    const after = Number.isFinite(poll.after) ? Number(poll.after) : 0;
    return send(res, 200, { ...session.snapshot(after), sessionId: poll.sessionId });
  }

  if (url === "/terminal/input") {
    const input = body as TerminalInputBody;
    const session = input.sessionId ? terminals.get(input.sessionId) : undefined;
    if (!session || !ownsTerminal(session, input.sessionToken)) {
      return send(res, 404, { error: { code: "no_session", message: "Unknown session." } });
    }
    const valid = validateTerminalInput(input, session.cumulativeInputChars);
    if (!valid.ok) return send(res, 400, { error: { code: valid.code, message: valid.message } });
    terminals.touch(input.sessionId!, Date.now());
    const result = session.writeInput(valid.data, valid.eof);
    if (!result.ok)
      return send(res, 409, { error: { code: result.code, message: result.message } });
    return send(res, 200, { ok: true });
  }

  if (url === "/terminal/stop") {
    const stop = body as TerminalStopBody;
    const session = stop.sessionId ? terminals.get(stop.sessionId) : undefined;
    if (session && !ownsTerminal(session, stop.sessionToken)) {
      return send(res, 404, { error: { code: "no_session", message: "Unknown session." } });
    }
    if (session) session.stop();
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: { code: "not_found", message: "Not found." } });
}

export function createDebuggerServer() {
  return createServer((req, res) => {
    handle(req, res).catch(() =>
      send(res, 500, { error: { code: "internal", message: "Internal error." } })
    );
  });
}

// Reap idle/expired sessions; tear down their processes and temp workspaces.
export function startSessionReaper(intervalMs = 15_000): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const id of sessions.expired(now)) {
      const session = sessions.remove(id);
      void session?.dispose();
    }
    reapTerminals(now);
  }, intervalMs);
}

/**
 * Terminal reaping (#664): kill wall/idle-expired sessions, and drop finished
 * sessions once their bounded transcript has been retained long enough. A
 * quietly-waiting program is never reaped for being quiet — only the browser
 * ceasing to poll (idle) or the hard wall/retain caps remove it.
 */
function reapTerminals(now: number): void {
  for (const id of terminals.expired(now)) {
    const session = terminals.remove(id);
    void session?.dispose();
  }
  for (const id of terminals.ids()) {
    const session = terminals.get(id);
    const finishedAt = session?.finishedAtMs;
    if (
      session &&
      finishedAt !== null &&
      finishedAt !== undefined &&
      now - finishedAt >= TERMINAL_LIMITS.retainAfterExitMs
    ) {
      terminals.remove(id);
      void session.dispose();
    }
  }
}

const isMain =
  typeof process.argv[1] === "string" && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const reaper = startSessionReaper();
  const server = createDebuggerServer();
  server.on("close", () => clearInterval(reaper));
  server.listen(PORT, () => {
    process.stdout.write(`gdb-debugger listening on :${PORT}\n`);
  });
}
