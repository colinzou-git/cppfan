/**
 * A focused parser for the GDB/MI (machine interface) output the debugger
 * service consumes (#442). GDB/MI values are c-strings ("..."), tuples ({...}),
 * and lists ([...]); result records are `name=value` pairs after a class token.
 * This implements just enough of the grammar to read stop reasons, the current
 * frame, the stack, and local variables — the snapshot the Code Lab renders.
 *
 * Pure and dependency-free so it is unit-tested without a running gdb.
 */

export type MiValue = string | MiValue[] | { [key: string]: MiValue };

export type GdbStopInfo = {
  reason: string | null;
  file: string | null;
  line: number | null;
  func: string | null;
};

export type GdbFrame = { level: number | null; func: string; file: string | null; line: number | null };
export type GdbVariable = { name: string; value: string };

function parseCString(input: string, start: number): [string, number] {
  // input[start] === '"'
  let i = start + 1;
  let out = "";
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\\") {
      const next = input[i + 1];
      out += next === "n" ? "\n" : next === "t" ? "\t" : next === "r" ? "\r" : next;
      i += 2;
      continue;
    }
    if (ch === '"') return [out, i + 1];
    out += ch;
    i += 1;
  }
  return [out, i];
}

function parseName(input: string, start: number): [string, number] {
  let i = start;
  while (i < input.length && /[A-Za-z0-9_-]/.test(input[i])) i += 1;
  return [input.slice(start, i), i];
}

function parseValue(input: string, start: number): [MiValue, number] {
  const ch = input[start];
  if (ch === '"') return parseCString(input, start);
  if (ch === "{") return parseTupleOrList(input, start, "{", "}");
  if (ch === "[") return parseTupleOrList(input, start, "[", "]");
  // Bareword fallback (rare): read until a separator.
  let i = start;
  while (i < input.length && !",}]".includes(input[i])) i += 1;
  return [input.slice(start, i), i];
}

function parseTupleOrList(input: string, start: number, open: string, close: string): [MiValue, number] {
  let i = start + 1;
  const obj: { [key: string]: MiValue } = {};
  const arr: MiValue[] = [];
  let isTuple = false;
  while (i < input.length && input[i] !== close) {
    if (input[i] === ",") {
      i += 1;
      continue;
    }
    // A `name=value` result, or a bare value (list element).
    if (/[A-Za-z_]/.test(input[i])) {
      const [name, afterName] = parseName(input, i);
      if (input[afterName] === "=") {
        const [value, afterValue] = parseValue(input, afterName + 1);
        obj[name] = value;
        arr.push({ [name]: value });
        isTuple = true;
        i = afterValue;
        continue;
      }
    }
    const [value, afterValue] = parseValue(input, i);
    arr.push(value);
    i = afterValue;
  }
  // Skip the closing bracket.
  const next = i + 1;
  // `{...}` of named results is a tuple/object; `[...]` keeps element order.
  if (open === "{" && isTuple) return [obj, next];
  return [arr, next];
}

/** Parse the `name=value` results of a record body (after the class token). */
export function parseResultRecord(body: string): { [key: string]: MiValue } {
  const [value] = parseTupleOrList(`{${body}}`, 0, "{", "}");
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asString(value: MiValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function toFrame(tuple: MiValue | undefined): GdbFrame | null {
  if (!tuple || typeof tuple !== "object" || Array.isArray(tuple)) return null;
  const level = asString(tuple.level);
  const line = asString(tuple.line);
  return {
    level: level != null ? Number(level) : null,
    func: asString(tuple.func) ?? "??",
    file: asString(tuple.file),
    line: line != null ? Number(line) : null
  };
}

/** Parse a `*stopped,...` async record into the stop reason and current frame. */
export function parseStopRecord(line: string): GdbStopInfo {
  const body = line.replace(/^[0-9]*\*stopped,?/, "");
  const record = parseResultRecord(body);
  const frame = toFrame(record.frame);
  return {
    reason: asString(record.reason),
    file: frame?.file ?? null,
    line: frame?.line ?? null,
    func: frame?.func ?? null
  };
}

/** Parse `^done,stack=[frame={...},...]` into ordered frames. */
export function parseStackListFrames(line: string): GdbFrame[] {
  const body = line.replace(/^[0-9]*\^done,?/, "");
  const record = parseResultRecord(body);
  const stack = record.stack;
  if (!Array.isArray(stack)) return [];
  return stack
    .map((entry) => (entry && typeof entry === "object" && !Array.isArray(entry) ? entry.frame : entry))
    .map((frame) => toFrame(frame))
    .filter((frame): frame is GdbFrame => frame !== null);
}

/** Parse `^done,variables=[{name="i",value="0"},...]`. */
export function parseVariables(line: string): GdbVariable[] {
  const body = line.replace(/^[0-9]*\^done,?/, "");
  const record = parseResultRecord(body);
  const variables = record.variables;
  if (!Array.isArray(variables)) return [];
  const out: GdbVariable[] = [];
  for (const entry of variables) {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const name = asString(entry.name);
      if (name != null) out.push({ name, value: asString(entry.value) ?? "" });
    }
  }
  return out;
}

/** Collect console stream output (`~"..."`) lines into text. */
export function parseConsoleStream(line: string): string | null {
  if (!/^[0-9]*~/.test(line)) return null;
  const quote = line.indexOf('"');
  if (quote < 0) return null;
  const [text] = parseCString(line, quote);
  return text;
}

/** Parse `^error,msg="..."` into the error message. */
export function parseErrorMessage(line: string): string | null {
  if (!/^[0-9]*\^error/.test(line)) return null;
  const record = parseResultRecord(line.replace(/^[0-9]*\^error,?/, ""));
  return asString(record.msg);
}

export function recordClass(line: string): string | null {
  const match = line.match(/^[0-9]*([*^+=])([A-Za-z-]+)/);
  return match ? match[2] : null;
}
