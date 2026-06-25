/**
 * In-memory debug session registry with idle + wall-clock expiry (#442).
 * Sessions are ephemeral: nothing is persisted, and a session is reaped once it
 * is idle too long or exceeds its total lifetime. The time-dependent logic is a
 * pure `expired(now)` so it is unit-tested without real timers, and the server
 * just drives it on an interval.
 */

export type ManagedSession<T> = {
  id: string;
  session: T;
  startedAt: number;
  lastActivity: number;
};

export type SessionManagerLimits = {
  sessionWallMs: number;
  idleTimeoutMs: number;
};

let counter = 0;
function defaultId(): string {
  counter += 1;
  return `sess-${counter}-${counter.toString(36)}`;
}

export class SessionManager<T> {
  private readonly sessions = new Map<string, ManagedSession<T>>();

  constructor(
    private readonly limits: SessionManagerLimits,
    private readonly idFactory: () => string = defaultId
  ) {}

  create(session: T, nowMs: number): ManagedSession<T> {
    const managed: ManagedSession<T> = {
      id: this.idFactory(),
      session,
      startedAt: nowMs,
      lastActivity: nowMs
    };
    this.sessions.set(managed.id, managed);
    return managed;
  }

  get(id: string): T | undefined {
    return this.sessions.get(id)?.session;
  }

  touch(id: string, nowMs: number): boolean {
    const managed = this.sessions.get(id);
    if (!managed) return false;
    managed.lastActivity = nowMs;
    return true;
  }

  /** Remove a session and return it so the caller can tear down its processes. */
  remove(id: string): T | undefined {
    const managed = this.sessions.get(id);
    if (!managed) return undefined;
    this.sessions.delete(id);
    return managed.session;
  }

  /** Ids whose wall-clock lifetime or idle window has elapsed. */
  expired(nowMs: number): string[] {
    const out: string[] = [];
    for (const managed of this.sessions.values()) {
      const overWall = nowMs - managed.startedAt >= this.limits.sessionWallMs;
      const overIdle = nowMs - managed.lastActivity >= this.limits.idleTimeoutMs;
      if (overWall || overIdle) out.push(managed.id);
    }
    return out;
  }

  get size(): number {
    return this.sessions.size;
  }

  ids(): string[] {
    return [...this.sessions.keys()];
  }
}
