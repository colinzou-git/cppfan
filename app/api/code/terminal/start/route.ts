import { NextResponse } from "next/server";
import { parseBodyRecord } from "@/features/code-lab/code-lab-request";
import { validateTerminalStartRequest } from "@/features/code-lab/code-terminal-request";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";
import {
  refusedTerminalSnapshot,
  unconfiguredTerminalSnapshot
} from "@/features/code-lab/code-terminal-adapter";
import { resolveCodeExecutionPlan } from "@/features/code-lab/code-execution-plan";
import { CODE_LAB_STALE_NOTE } from "@/features/code-lab/code-lab-item-resolver";
import { ITEM_UNAVAILABLE_NOTE } from "@/features/code-lab/code-lab-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const body = parseBodyRecord(await request.json().catch(() => null));
  if (!body) return apiError("invalid_request", "A valid terminal request is required.", 400);

  const parsed = validateTerminalStartRequest(body);
  if (!parsed.ok) return apiError(parsed.code, parsed.message, 400);

  const planned = await resolveCodeExecutionPlan({
    itemId: parsed.itemId,
    expectedContentVersionId: parsed.contentVersionId,
    milestoneIndex: parsed.milestoneIndex,
    learnerSource: parsed.source
  });
  if (planned.status === "stale_definition") {
    return NextResponse.json(
      { result: refusedTerminalSnapshot("stale_definition", CODE_LAB_STALE_NOTE) },
      { headers: NO_STORE }
    );
  }
  if (planned.status === "item_unavailable") {
    return NextResponse.json(
      { result: refusedTerminalSnapshot("item_unavailable", ITEM_UNAVAILABLE_NOTE) },
      { headers: NO_STORE }
    );
  }
  if (planned.status === "invalid_contract") {
    return NextResponse.json(
      { result: refusedTerminalSnapshot("invalid_contract", planned.message) },
      { headers: NO_STORE }
    );
  }

  const selection = selectTerminalProvider();
  if (selection.kind === "unconfigured") {
    return NextResponse.json(
      { result: unconfiguredTerminalSnapshot(selection.note) },
      { headers: NO_STORE }
    );
  }

  try {
    const result = await selection.adapter.start({
      source: planned.plan.preparedSource,
      stdin: parsed.stdin,
      files: planned.plan.files,
      compilerFlags: planned.plan.compilerFlags
    });
    const terminalAttemptId = result.sessionId ? crypto.randomUUID() : undefined;
    return NextResponse.json(
      {
        result: {
          ...result,
          terminalAttemptId,
          provider: selection.adapter.name
        }
      },
      { headers: NO_STORE }
    );
  } catch {
    return apiError("terminal_error", "The terminal service failed to start a session.", 502);
  }
}
