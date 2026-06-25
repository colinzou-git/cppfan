import { NextResponse } from "next/server";
import { selectDebugger } from "@/features/code-lab/code-debugger-service";
import type { CodeDebuggerHealth } from "@/features/code-lab/code-debug-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

export async function GET() {
  const selection = selectDebugger();
  if (selection.kind === "unconfigured") {
    const result: CodeDebuggerHealth = { status: "unconfigured", message: selection.note };
    return NextResponse.json({ result }, { headers: NO_STORE });
  }

  const result = await selection.adapter.health();
  return NextResponse.json({ result }, { headers: NO_STORE });
}
