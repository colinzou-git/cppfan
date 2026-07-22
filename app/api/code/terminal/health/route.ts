import { NextResponse } from "next/server";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";
import type { CodeTerminalHealth } from "@/features/code-lab/code-terminal-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

export async function GET() {
  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    const result: CodeTerminalHealth = { status: "unconfigured", message: selection.note };
    return NextResponse.json({ result }, { headers: NO_STORE });
  }

  const result = await selection.adapter.health();
  return NextResponse.json({ result }, { headers: NO_STORE });
}
