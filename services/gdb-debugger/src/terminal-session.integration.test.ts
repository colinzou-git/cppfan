import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { TerminalSession } from "./terminal-session";

/**
 * Real-child-process coverage for the interactive terminal (#664). These compile
 * and run small C++ programs, so they require a C++ toolchain and are skipped
 * automatically where `g++` is unavailable (they run in the OVH/CI toolchain
 * image). `pnpm verify` must not require them.
 */
function hasToolchain(): boolean {
  try {
    execSync("g++ --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const runIf = hasToolchain() ? describe : describe.skip;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntil(fn: () => boolean, timeoutMs = 8000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fn()) return;
    await delay(15);
  }
  throw new Error("timed out waiting for condition");
}

function text(session: TerminalSession, kind?: string): string {
  return session
    .snapshot(0)
    .events.filter((e) => !kind || e.kind === kind)
    .map((e) => e.text)
    .join("");
}

async function newSession(
  source: string,
  stdin = "",
  files: Array<{ name: string; content: string }> = [],
  compilerFlags = ["-std=c++20", "-Wall", "-Wextra", "-Wpedantic", "-O0"]
): Promise<TerminalSession> {
  const session = new TerminalSession(
    { source, initialStdin: stdin, files, compilerFlags },
    "test-token"
  );
  await session.start();
  return session;
}

runIf("TerminalSession integration (#664)", () => {
  it("answers cin >> int after a prompt", async () => {
    const session = await newSession(
      `#include <iostream>
int main(){int x; std::cout<<"n? "<<std::flush; std::cin>>x; std::cout<<"got "<<x*2<<std::endl;}`
    );
    await waitUntil(() => text(session, "stdout").includes("n? "));
    expect(session.writeInput("21\n", false)).toEqual({ ok: true });
    await waitUntil(() => text(session, "stdout").includes("got 42"));
    await session.dispose();
  });

  it("reads a getline containing spaces", async () => {
    const session = await newSession(
      `#include <iostream>
#include <string>
int main(){std::string s; std::getline(std::cin,s); std::cout<<"["<<s<<"]"<<std::endl;}`
    );
    session.writeInput("hello there world\n", false);
    await waitUntil(() => text(session, "stdout").includes("[hello there world]"));
    await session.dispose();
  });

  it("handles two sequential reads with output between them", async () => {
    const session = await newSession(
      `#include <iostream>
int main(){int a,b; std::cin>>a; std::cout<<"a="<<a<<std::endl; std::cin>>b; std::cout<<"b="<<b<<std::endl;}`
    );
    session.writeInput("3\n", false);
    await waitUntil(() => text(session, "stdout").includes("a=3"));
    session.writeInput("4\n", false);
    await waitUntil(() => text(session, "stdout").includes("b=4"));
    await session.dispose();
  });

  it("accepts an empty input line for getline", async () => {
    const session = await newSession(
      `#include <iostream>
#include <string>
int main(){std::string s; std::getline(std::cin,s); std::cout<<"len="<<s.size()<<std::endl;}`
    );
    session.writeInput("\n", false);
    await waitUntil(() => text(session, "stdout").includes("len=0"));
    await session.dispose();
  });

  it("sends Input Args once, then accepts later live input", async () => {
    const session = await newSession(
      `#include <iostream>
int main(){int a,b; std::cin>>a; std::cout<<"first="<<a<<std::endl; std::cin>>b; std::cout<<"second="<<b<<std::endl;}`,
      "10\n"
    );
    await waitUntil(() => text(session, "stdout").includes("first=10"));
    // Input Args appears exactly once in the transcript as a stdin event.
    expect(text(session, "stdin").match(/10/g)?.length).toBe(1);
    session.writeInput("20\n", false);
    await waitUntil(() => text(session, "stdout").includes("second=20"));
    await session.dispose();
  });

  it("lets a while(getline) loop exit on Send EOF", async () => {
    const session = await newSession(
      `#include <iostream>
#include <string>
int main(){std::string s; int n=0; while(std::getline(std::cin,s)) n++; std::cout<<"lines="<<n<<std::endl;}`
    );
    session.writeInput("a\n", false);
    session.writeInput("b\n", false);
    session.writeInput("", true); // EOF
    await waitUntil(() => session.isFinished);
    expect(session.snapshot(0).status).toBe("exited");
    expect(text(session, "stdout")).toContain("lines=2");
    await session.dispose();
  });

  it("returns the exit code on natural exit", async () => {
    const session = await newSession(`int main(){return 3;}`);
    await waitUntil(() => session.isFinished);
    const snap = session.snapshot(0);
    expect(snap.status).toBe("exited");
    expect(snap.exitCode).toBe(3);
    await session.dispose();
  });

  it("reports a compile error and never starts a process", async () => {
    const session = await newSession(`int main(){ this is not c++ }`);
    const snap = session.snapshot(0);
    expect(snap.status).toBe("compile_error");
    expect(snap.events.some((e) => e.kind === "compiler")).toBe(true);
    // Writing input to a non-running session is refused.
    expect(session.writeInput("x\n", false)).toMatchObject({ ok: false });
    await session.dispose();
  });

  it("runs function-only source after the app harness prepares it", async () => {
    const session = await newSession(
      `#include <iostream>
int add(int a, int b){ return a + b; }
int main(){ int a,b; std::cin >> a >> b; std::cout << add(a,b) << "\\n"; }`,
      "2 3\n"
    );
    await waitUntil(() => session.isFinished);
    expect(text(session, "stdout")).toContain("5");
    await session.dispose();
  });

  it("materializes nested and multiple fixtures in the working directory", async () => {
    const session = await newSession(
      `#include <fstream>
#include <iostream>
#include <string>
int main(){std::string a,b;std::ifstream("fixtures/a.txt")>>a;std::ifstream("b.txt")>>b;std::cout<<a<<" "<<b;}`,
      "",
      [
        { name: "fixtures/a.txt", content: "nested" },
        { name: "b.txt", content: "second" }
      ]
    );
    await waitUntil(() => session.isFinished);
    expect(text(session, "stdout")).toContain("nested second");
    await session.dispose();
  });

  it("applies supplied flags once and compiles C++20 syntax", async () => {
    const session = await newSession(
      `#include <iostream>
int main(){ auto square=[](int x){return x*x;}; std::cout<<square(4); }`,
      "",
      [],
      ["-std=c++20", "-Wall", "-Wextra", "-Wpedantic", "-O0"]
    );
    await waitUntil(() => session.isFinished);
    expect(session.snapshot(0).status).toBe("exited");
    expect(text(session, "stdout")).toContain("16");
    await session.dispose();
  });

  it("stops an infinite program and is idempotent", async () => {
    const session = await newSession(`int main(){ for(;;){} }`);
    await waitUntil(() => session.snapshot(0).status === "running");
    session.stop();
    await waitUntil(() => session.isFinished);
    expect(session.snapshot(0).status).toBe("stopped");
    // Second stop is a no-op.
    expect(() => session.stop()).not.toThrow();
    await session.dispose();
  });
});
