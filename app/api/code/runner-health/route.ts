import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HealthPayload = {
  provider: string;
  configured: boolean;
  reachable: boolean;
  status?: number;
  cppLanguageId?: number | null;
  note?: string;
};

export async function GET() {
  const provider = (process.env.CODE_RUNNER_PROVIDER?.trim().toLowerCase() || "mock");

  if (provider === "mock") {
    return health({
      provider,
      configured: true,
      reachable: true,
      cppLanguageId: null,
      note: "Mock runner is local, deterministic, and simulated."
    });
  }

  if (provider !== "judge0") {
    return health(
      {
        provider,
        configured: true,
        reachable: false,
        cppLanguageId: null,
        note: "Runner health check currently verifies mock and Judge0 providers."
      },
      503
    );
  }

  const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim();
  const token = process.env.CODE_RUNNER_API_KEY?.trim();
  const languageId = Number(process.env.CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID?.trim());

  if (!baseUrl || !Number.isInteger(languageId) || languageId <= 0) {
    return health(
      {
        provider,
        configured: false,
        reachable: false,
        cppLanguageId: Number.isInteger(languageId) ? languageId : null,
        note: "Missing CODE_RUNNER_BASE_URL or CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID."
      },
      503
    );
  }

  const headers: Record<string, string> = {};
  if (token) headers["X-Auth-Token"] = token;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/languages`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5_000)
    });

    return health(
      {
        provider,
        configured: true,
        reachable: response.ok,
        status: response.status,
        cppLanguageId: languageId,
        note: response.ok ? "Judge0 languages endpoint is reachable." : "Judge0 languages endpoint rejected the request."
      },
      response.ok ? 200 : 503
    );
  } catch {
    return health(
      {
        provider,
        configured: true,
        reachable: false,
        cppLanguageId: languageId,
        note: "Could not reach Judge0."
      },
      503
    );
  }
}

function health(payload: HealthPayload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "cache-control": "no-store" }
  });
}
