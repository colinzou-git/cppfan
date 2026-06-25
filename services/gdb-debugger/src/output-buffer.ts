/**
 * A byte-capped append buffer for a debugged program's stdout/stderr (#442).
 * Once the cap is reached, further writes are dropped and the buffer is marked
 * truncated, so a runaway program can never exhaust service memory.
 */
export class OutputBuffer {
  private chunks: string[] = [];
  private size = 0;
  private truncatedFlag = false;

  constructor(private readonly maxBytes: number) {}

  append(text: string): void {
    if (!text || this.size >= this.maxBytes) {
      if (text) this.truncatedFlag = true;
      return;
    }
    const remaining = this.maxBytes - this.size;
    if (text.length <= remaining) {
      this.chunks.push(text);
      this.size += text.length;
    } else {
      this.chunks.push(text.slice(0, remaining));
      this.size = this.maxBytes;
      this.truncatedFlag = true;
    }
  }

  get truncated(): boolean {
    return this.truncatedFlag;
  }

  toString(): string {
    const joined = this.chunks.join("");
    return this.truncatedFlag ? `${joined}\n…[output truncated]` : joined;
  }
}
