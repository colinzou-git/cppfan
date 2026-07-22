/**
 * Ordered, sequence-numbered, byte-capped transcript for one interactive
 * terminal session (#664). Compiler diagnostics, program stdout/stderr, learner
 * input, and system notices are appended in observation order; each event gets a
 * monotonically increasing `sequence` so the browser can poll with a cursor and
 * receive only what it has not seen yet. Once the byte or event cap is reached a
 * single visible truncation notice is emitted and further writes are dropped, so
 * a runaway program can never exhaust service memory.
 *
 * Pure and clock-injectable, so it is unit-tested without spawning anything.
 */

export type TerminalEventKind = "compiler" | "stdout" | "stderr" | "stdin" | "system";

export type TerminalEvent = {
  sequence: number;
  kind: TerminalEventKind;
  text: string;
  createdAt: string;
};

const TRUNCATION_NOTICE = "\n…[terminal output truncated: safety limit reached]";

/** Longest prefix of `text` whose UTF-8 encoding fits within `maxBytes`. */
function truncateToByteLimit(text: string, maxBytes: number): string {
  if (maxBytes <= 0) return "";
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
  let end = Math.min(text.length, maxBytes);
  while (end > 0 && Buffer.byteLength(text.slice(0, end), "utf8") > maxBytes) end -= 1;
  return text.slice(0, end);
}

export class TerminalEventBuffer {
  private readonly events: TerminalEvent[] = [];
  private seq = 0;
  private bytes = 0;
  private truncatedFlag = false;

  constructor(
    private readonly maxBytes: number,
    private readonly maxEvents: number,
    private readonly clock: () => string = () => new Date().toISOString()
  ) {}

  /**
   * Append text observed on one stream. Returns the stored event, or null when
   * nothing was stored (empty text, or the buffer is already truncated). Long
   * writes are clipped to the remaining budget and then the buffer is sealed with
   * a single truncation notice.
   */
  append(kind: TerminalEventKind, text: string): TerminalEvent | null {
    if (!text || this.truncatedFlag) return null;
    const size = Buffer.byteLength(text, "utf8");
    const overCount = this.events.length + 1 > this.maxEvents;
    const overBytes = this.bytes + size > this.maxBytes;
    if (overCount || overBytes) {
      const payload = overBytes ? truncateToByteLimit(text, this.maxBytes - this.bytes) : text;
      const stored = payload ? this.push(kind, payload) : null;
      this.seal();
      return stored;
    }
    return this.push(kind, text);
  }

  private push(kind: TerminalEventKind, text: string): TerminalEvent {
    this.seq += 1;
    this.bytes += Buffer.byteLength(text, "utf8");
    const event: TerminalEvent = { sequence: this.seq, kind, text, createdAt: this.clock() };
    this.events.push(event);
    return event;
  }

  /** Emit the one-time truncation notice (bypasses the caps by design). */
  private seal(): void {
    if (this.truncatedFlag) return;
    this.truncatedFlag = true;
    this.seq += 1;
    this.events.push({
      sequence: this.seq,
      kind: "system",
      text: TRUNCATION_NOTICE,
      createdAt: this.clock()
    });
  }

  /** Events observed strictly after the supplied cursor, in order. */
  since(after: number): TerminalEvent[] {
    if (after <= 0) return [...this.events];
    return this.events.filter((event) => event.sequence > after);
  }

  /** Cursor the client should send on its next poll (highest sequence emitted). */
  get lastSequence(): number {
    return this.seq;
  }

  get truncated(): boolean {
    return this.truncatedFlag;
  }

  get count(): number {
    return this.events.length;
  }
}
