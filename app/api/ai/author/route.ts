import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  completeAiResponse,
  getAiProviderConfig,
  isAiChatEnabled
} from "@/features/ai-chat/ai-chat-provider";
import { getAiProviderPreferenceOverride } from "@/features/ai-chat/provider-preferences";
import { getAttachmentsForOwner, getContentItemForOwner, getExerciseForOwner, getLabForOwner } from "@/features/user-content/user-content-queries";
import { generateAuthoringProposal } from "@/features/user-content/ai-authoring-service";
import { generateExerciseAuthoringProposal } from "@/features/user-content/exercise-ai-authoring-service";
import { generateLabAuthoringProposal } from "@/features/user-content/lab-ai-authoring-service";
import type { AuthoringAttachmentRef } from "@/features/user-content/ai-authoring-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INSTRUCTION_CHARS = 4000;
const REQUEST_TIMEOUT_MS = Math.max(5000, Math.min(120000, Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45000));

function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

const EXTERNAL_KINDS = new Set(["url", "github_url", "lesson_ref"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return apiError("supabase_unconfigured", "Sign-in storage is not configured.", 503);
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return apiError("authentication_required", "Sign in to use AI authoring.", 401);
  }

  const override = await getAiProviderPreferenceOverride();
  if (!isAiChatEnabled(override)) {
    return apiError("ai_disabled", "AI authoring is not enabled.", 503);
  }

  let body: { contentId?: unknown; instruction?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return apiError("invalid_request", "A valid JSON body is required.", 400);
  }
  const contentId = typeof body?.contentId === "string" ? body.contentId : "";
  const instruction = typeof body?.instruction === "string" ? body.instruction.slice(0, MAX_INSTRUCTION_CHARS) : "";
  if (!contentId || instruction.trim().length === 0) {
    return apiError("invalid_request", "A content id and an instruction are required.", 400);
  }

  const detail = await getContentItemForOwner(contentId);
  if (!detail) {
    return apiError("not_found", "That content was not found.", 404);
  }

  if (detail.kind === "exercise") {
    const exercise = await getExerciseForOwner(contentId);
    const exPayload = exercise?.draftPayload ?? exercise?.publishedPayload;
    if (!exPayload) {
      return apiError("no_draft", "There is no exercise draft to work from yet.", 400);
    }
    const exConfig = getAiProviderConfig(override);
    const exController = new AbortController();
    const exTimeout = setTimeout(() => exController.abort(), REQUEST_TIMEOUT_MS);
    try {
      const result = await generateExerciseAuthoringProposal({
        payload: exPayload,
        instruction,
        providerKind: exConfig.provider,
        complete: (messages) => completeAiResponse({ messages, signal: exController.signal })
      });
      if (result.status === "ok") {
        return NextResponse.json({ proposal: result.proposal }, { headers: { "cache-control": "no-store" } });
      }
      if (result.status === "invalid") {
        return apiError("proposal_invalid", result.message, 422);
      }
      return apiError("provider_error", "The AI provider could not complete the request.", 502);
    } catch {
      return apiError("provider_error", "The AI provider could not complete the request.", 502);
    } finally {
      clearTimeout(exTimeout);
    }
  }

  if (detail.kind === "lab") {
    const lab = await getLabForOwner(contentId);
    const labPayload = lab?.draftPayload ?? lab?.publishedPayload;
    if (!labPayload) {
      return apiError("no_draft", "There is no lab draft to work from yet.", 400);
    }
    const labConfig = getAiProviderConfig(override);
    const labController = new AbortController();
    const labTimeout = setTimeout(() => labController.abort(), REQUEST_TIMEOUT_MS);
    try {
      const result = await generateLabAuthoringProposal({
        payload: labPayload,
        instruction,
        providerKind: labConfig.provider,
        complete: (messages) => completeAiResponse({ messages, signal: labController.signal })
      });
      if (result.status === "ok") {
        return NextResponse.json({ proposal: result.proposal }, { headers: { "cache-control": "no-store" } });
      }
      if (result.status === "invalid") {
        return apiError("proposal_invalid", result.message, 422);
      }
      return apiError("provider_error", "The AI provider could not complete the request.", 502);
    } catch {
      return apiError("provider_error", "The AI provider could not complete the request.", 502);
    } finally {
      clearTimeout(labTimeout);
    }
  }

  const payload = detail.draftPayload ?? detail.publishedPayload;
  if (!payload) {
    return apiError("no_draft", "There is no lesson draft to work from yet.", 400);
  }

  const attachments: AuthoringAttachmentRef[] = (await getAttachmentsForOwner(contentId))
    .filter((a) => a.visibility === "author_source" && EXTERNAL_KINDS.has(a.kind))
    .map((a) => ({
      kind: a.kind as AuthoringAttachmentRef["kind"],
      url: a.externalUrl,
      referencedLearningItemId: a.referencedLearningItemId,
      filename: a.filename
    }));

  const config = getAiProviderConfig(override);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const result = await generateAuthoringProposal({
      payload,
      instruction,
      attachments,
      providerKind: config.provider,
      complete: (messages) => completeAiResponse({ messages, signal: controller.signal })
    });
    if (result.status === "ok") {
      return NextResponse.json({ proposal: result.proposal }, { headers: { "cache-control": "no-store" } });
    }
    if (result.status === "invalid") {
      return apiError("proposal_invalid", result.message, 422);
    }
    return apiError("provider_error", "The AI provider could not complete the request.", 502);
  } catch {
    return apiError("provider_error", "The AI provider could not complete the request.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
