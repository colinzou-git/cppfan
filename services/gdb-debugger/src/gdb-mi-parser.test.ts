import { describe, expect, it } from "vitest";
import {
  parseConsoleStream,
  parseErrorMessage,
  parseStackListFrames,
  parseStopRecord,
  parseVariables,
  recordClass
} from "./gdb-mi-parser";

describe("gdb-mi-parser (#442)", () => {
  it("extracts the stop reason and current frame from *stopped", () => {
    const line =
      '*stopped,reason="breakpoint-hit",disp="keep",bkptno="1",' +
      'frame={addr="0x1",func="main",args=[],file="main.cpp",fullname="/tmp/main.cpp",line="5"},' +
      'thread-id="1",stopped-threads="all"';
    expect(parseStopRecord(line)).toEqual({
      reason: "breakpoint-hit",
      file: "main.cpp",
      line: 5,
      func: "main"
    });
  });

  it("handles an end-of-step stop with an exited reason", () => {
    expect(parseStopRecord('*stopped,reason="exited-normally"')).toEqual({
      reason: "exited-normally",
      file: null,
      line: null,
      func: null
    });
  });

  it("extracts ordered frames from -stack-list-frames", () => {
    const line =
      '^done,stack=[frame={level="0",addr="0x1",func="main",file="main.cpp",line="5"},' +
      'frame={level="1",func="__libc_start_main"}]';
    const frames = parseStackListFrames(line);
    expect(frames).toHaveLength(2);
    expect(frames[0]).toEqual({ level: 0, func: "main", file: "main.cpp", line: 5 });
    expect(frames[1].func).toBe("__libc_start_main");
    expect(frames[1].line).toBeNull();
  });

  it("extracts local variables from -stack-list-variables", () => {
    const line = '^done,variables=[{name="i",arg="0",value="0"},{name="n",value="10"}]';
    expect(parseVariables(line)).toEqual([
      { name: "i", value: "0" },
      { name: "n", value: "10" }
    ]);
  });

  it("unescapes a console stream record", () => {
    expect(parseConsoleStream('~"Hello\\n"')).toBe("Hello\n");
    expect(parseConsoleStream('^done,foo="bar"')).toBeNull();
  });

  it("reads an error message", () => {
    expect(parseErrorMessage('^error,msg="No symbol \\"x\\" in current context."')).toBe(
      'No symbol "x" in current context.'
    );
    expect(parseErrorMessage("^done")).toBeNull();
  });

  it("classifies record types", () => {
    expect(recordClass("*stopped,reason=\"x\"")).toBe("stopped");
    expect(recordClass("^done")).toBe("done");
    expect(recordClass("=thread-group-added,id=\"i1\"")).toBe("thread-group-added");
  });
});
