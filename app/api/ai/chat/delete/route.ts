import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteConversation, deleteItemConversations } from "@/features/ai-chat/ai-chat-store";
import { isAiChatSourceKind } from "@/features/ai-chat/ai-chat-context";

function safeReturn(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/";
  return path.startsWith("/tutor?") ? path : "/";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/login", request.url), 303);
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const form = await request.formData();
  const returnTo = safeReturn(form.get("returnTo"));
  const conversationId = form.get("conversationId");
  const sourceKind = form.get("sourceKind");
  const sourceId = form.get("sourceId");

  if (typeof conversationId === "string" && conversationId) {
    await deleteConversation({ supabase, userId: data.user.id, conversationId });
  } else if (
    form.get("allForItem") === "true" &&
    typeof sourceKind === "string" &&
    isAiChatSourceKind(sourceKind) &&
    typeof sourceId === "string" &&
    sourceId
  ) {
    await deleteItemConversations({ supabase, userId: data.user.id, sourceKind, sourceId });
  }

  return NextResponse.redirect(new URL(returnTo, request.url), 303);
}
