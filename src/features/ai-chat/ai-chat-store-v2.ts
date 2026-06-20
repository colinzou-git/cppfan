import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AiChatConversationView,
  AiChatMessageRole,
  AiChatMessageStatus,
  AiChatMessageView,
  AiChatSourceKind
} from "./ai-chat-types";

type ConversationRow = {
  id: string;
  user_id: string;
  source_kind: AiChatSourceKind;
  source_id: string;
  source_version: string;
  title: string;
  provider: string | null;
  model: string | null;
  context_fingerprint: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  user_id: string;
  request_id: string;
  role: AiChatMessageRole;
  content: string;
  status: AiChatMessageStatus;
  provider: string | null;
  model: string | null;
  created_at: string;
};

export type AiChatUsage = {
  requestCount: number;
  inputChars: number;
  outputChars: number;
};

function mapMessage(row: MessageRow): AiChatMessageView {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    requestId: row.request_id,
    role: row.role,
    content: row.content,
    status: row.status,
    provider: row.provider,
    model: row.model,
    createdAt: row.created_at
  };
}

function mapConversation(row: ConversationRow, messages: AiChatMessageView[] = []): AiChatConversationView {
  return {
    id: row.id,
    sourceKind: row.source_kind,
    sourceId: row.source_id,
    sourceVersion: row.source_version,
    title: row.title,
    provider: row.provider,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages
  };
}

export async function listItemConversations({ supabase, userId, sourceKind, sourceId }: {
  supabase: SupabaseClient; userId: string; sourceKind: AiChatSourceKind; sourceId: string;
}): Promise<AiChatConversationView[]> {
  const result = await supabase.from("ai_chat_conversations")
    .select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at")
    .eq("user_id", userId).eq("source_kind", sourceKind).eq("source_id", sourceId)
    .order("updated_at", { ascending: false }).limit(30);
  if (result.error) throw result.error;
  const rows = (result.data ?? []) as ConversationRow[];
  const conversations: AiChatConversationView[] = [];
  for (const row of rows) {
    const messages = await getConversationMessages({ supabase, userId, conversationId: row.id, limit: 200 });
    conversations.push(mapConversation(row, messages));
  }
  return conversations;
}

export async function getOwnedConversation({ supabase, userId, conversationId }: {
  supabase: SupabaseClient; userId: string; conversationId: string;
}): Promise<ConversationRow | null> {
  const result = await supabase.from("ai_chat_conversations")
    .select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at")
    .eq("id", conversationId).eq("user_id", userId).maybeSingle();
  if (result.error) throw result.error;
  return (result.data as ConversationRow | null) ?? null;
}

export async function createConversation({ supabase, userId, sourceKind, sourceId, sourceVersion, title, provider, model, contextFingerprint }: {
  supabase: SupabaseClient; userId: string; sourceKind: AiChatSourceKind; sourceId: string;
  sourceVersion: string; title: string; provider: string; model: string; contextFingerprint: string;
}): Promise<ConversationRow> {
  const result = await supabase.from("ai_chat_conversations").insert({
    user_id: userId, source_kind: sourceKind, source_id: sourceId, source_version: sourceVersion,
    title, provider, model, context_fingerprint: contextFingerprint
  }).select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at").single();
  if (result.error) throw result.error;
  return result.data as ConversationRow;
}

export async function getConversationMessages({ supabase, userId, conversationId, limit = 100 }: {
  supabase: SupabaseClient; userId: string; conversationId: string; limit?: number;
}): Promise<AiChatMessageView[]> {
  const result = await supabase.from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at,sequence")
    .eq("user_id", userId).eq("conversation_id", conversationId)
    .order("sequence", { ascending: true }).limit(Math.max(1, Math.min(500, limit)));
  if (result.error) throw result.error;
  return ((result.data ?? []) as MessageRow[]).map(mapMessage);
}

export async function getRecentConversationMessages({ supabase, userId, conversationId, limit = 40 }: {
  supabase: SupabaseClient; userId: string; conversationId: string; limit?: number;
}): Promise<AiChatMessageView[]> {
  const result = await supabase.from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at,sequence")
    .eq("user_id", userId).eq("conversation_id", conversationId)
    .order("sequence", { ascending: false }).limit(Math.max(1, Math.min(80, limit)));
  if (result.error) throw result.error;
  return ((result.data ?? []) as MessageRow[]).reverse().map(mapMessage);
}

async function findMessage({ supabase, userId, conversationId, requestId, role }: {
  supabase: SupabaseClient; userId: string; conversationId: string; requestId: string; role: AiChatMessageRole;
}): Promise<MessageRow | null> {
  const result = await supabase.from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at")
    .eq("user_id", userId).eq("conversation_id", conversationId).eq("request_id", requestId).eq("role", role).maybeSingle();
  if (result.error) throw result.error;
  return (result.data as MessageRow | null) ?? null;
}

async function touchConversation({ supabase, userId, conversationId }: {
  supabase: SupabaseClient; userId: string; conversationId: string;
}): Promise<void> {
  const result = await supabase.from("ai_chat_conversations")
    .update({ updated_at: new Date().toISOString() }).eq("id", conversationId).eq("user_id", userId);
  if (result.error) throw result.error;
}

export async function appendMessage({ supabase, userId, conversationId, requestId, role, content, status, provider, model }: {
  supabase: SupabaseClient; userId: string; conversationId: string; requestId: string;
  role: AiChatMessageRole; content: string; status: AiChatMessageStatus; provider?: string | null; model?: string | null;
}): Promise<AiChatMessageView> {
  const existing = await findMessage({ supabase, userId, conversationId, requestId, role });
  if (existing) return mapMessage(existing);
  const result = await supabase.from("ai_chat_messages").insert({
    conversation_id: conversationId, user_id: userId, request_id: requestId, role, content, status,
    provider: provider ?? null, model: model ?? null
  }).select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at").single();
  if (!result.error) {
    await touchConversation({ supabase, userId, conversationId });
    return mapMessage(result.data as MessageRow);
  }
  const raced = await findMessage({ supabase, userId, conversationId, requestId, role });
  if (raced) return mapMessage(raced);
  throw result.error;
}

export async function saveAssistantMessage({ supabase, userId, conversationId, requestId, content, status, provider, model }: {
  supabase: SupabaseClient; userId: string; conversationId: string; requestId: string; content: string;
  status: AiChatMessageStatus; provider: string; model: string;
}): Promise<AiChatMessageView> {
  const existing = await findMessage({ supabase, userId, conversationId, requestId, role: "assistant" });
  if (!existing) return appendMessage({ supabase, userId, conversationId, requestId, role: "assistant", content, status, provider, model });
  const result = await supabase.from("ai_chat_messages").update({ content, status, provider, model })
    .eq("id", existing.id).eq("user_id", userId)
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at").single();
  if (result.error) throw result.error;
  await touchConversation({ supabase, userId, conversationId });
  return mapMessage(result.data as MessageRow);
}

export async function getCompletedAssistantForRequest({ supabase, userId, conversationId, requestId }: {
  supabase: SupabaseClient; userId: string; conversationId: string; requestId: string;
}): Promise<AiChatMessageView | null> {
  const existing = await findMessage({ supabase, userId, conversationId, requestId, role: "assistant" });
  return existing?.status === "complete" ? mapMessage(existing) : null;
}

export async function deleteConversation({ supabase, userId, conversationId }: {
  supabase: SupabaseClient; userId: string; conversationId: string;
}): Promise<void> {
  const result = await supabase.from("ai_chat_conversations").delete().eq("id", conversationId).eq("user_id", userId);
  if (result.error) throw result.error;
}

export async function deleteItemConversations({ supabase, userId, sourceKind, sourceId }: {
  supabase: SupabaseClient; userId: string; sourceKind: AiChatSourceKind; sourceId: string;
}): Promise<void> {
  const result = await supabase.from("ai_chat_conversations").delete()
    .eq("user_id", userId).eq("source_kind", sourceKind).eq("source_id", sourceId);
  if (result.error) throw result.error;
}

export async function getTodayAiChatUsage({ supabase, userId, now = new Date() }: {
  supabase: SupabaseClient; userId: string; now?: Date;
}): Promise<AiChatUsage> {
  const start = new Date(now); start.setUTCHours(0, 0, 0, 0);
  const result = await supabase.from("ai_chat_usage_events").select("event_kind,input_chars,output_chars")
    .eq("user_id", userId).gte("created_at", start.toISOString()).order("created_at", { ascending: false }).limit(1000);
  if (result.error) throw result.error;
  let requestCount = 0; let inputChars = 0; let outputChars = 0;
  for (const row of (result.data ?? []) as Array<{ event_kind: "request" | "output"; input_chars: number; output_chars: number }>) {
    if (row.event_kind === "request") requestCount += 1;
    inputChars += Math.max(0, row.input_chars ?? 0);
    outputChars += Math.max(0, row.output_chars ?? 0);
  }
  return { requestCount, inputChars, outputChars };
}

export async function getRecentAiChatRequestCount({ supabase, userId, since }: {
  supabase: SupabaseClient; userId: string; since: Date;
}): Promise<number> {
  const result = await supabase.from("ai_chat_usage_events").select("id", { count: "exact", head: true })
    .eq("user_id", userId).eq("event_kind", "request").gte("created_at", since.toISOString());
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function recordAiChatUsageEvent({ supabase, userId, eventKind, inputChars = 0, outputChars = 0 }: {
  supabase: SupabaseClient; userId: string; eventKind: "request" | "output"; inputChars?: number; outputChars?: number;
}): Promise<void> {
  const result = await supabase.from("ai_chat_usage_events").insert({
    user_id: userId, event_kind: eventKind,
    input_chars: Math.max(0, Math.trunc(inputChars)), output_chars: Math.max(0, Math.trunc(outputChars))
  });
  if (result.error) throw result.error;
}
