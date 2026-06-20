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

export type AiChatQuota = {
  allowed: boolean;
  requestCount: number;
  inputChars: number;
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

function mapConversation(
  row: ConversationRow,
  messages: AiChatMessageView[] = []
): AiChatConversationView {
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

export async function listItemConversations({
  supabase,
  userId,
  sourceKind,
  sourceId
}: {
  supabase: SupabaseClient;
  userId: string;
  sourceKind: AiChatSourceKind;
  sourceId: string;
}): Promise<AiChatConversationView[]> {
  const result = await supabase
    .from("ai_chat_conversations")
    .select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at")
    .eq("user_id", userId)
    .eq("source_kind", sourceKind)
    .eq("source_id", sourceId)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (result.error) throw result.error;
  const rows = (result.data ?? []) as ConversationRow[];
  const conversations: AiChatConversationView[] = [];
  for (const row of rows) {
    const messages = await getConversationMessages({
      supabase,
      userId,
      conversationId: row.id,
      limit: 200
    });
    conversations.push(mapConversation(row, messages));
  }
  return conversations;
}

export async function getOwnedConversation({
  supabase,
  userId,
  conversationId
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
}): Promise<ConversationRow | null> {
  const result = await supabase
    .from("ai_chat_conversations")
    .select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (result.error) throw result.error;
  return (result.data as ConversationRow | null) ?? null;
}

export async function createConversation({
  supabase,
  userId,
  sourceKind,
  sourceId,
  sourceVersion,
  title,
  provider,
  model,
  contextFingerprint
}: {
  supabase: SupabaseClient;
  userId: string;
  sourceKind: AiChatSourceKind;
  sourceId: string;
  sourceVersion: string;
  title: string;
  provider: string;
  model: string;
  contextFingerprint: string;
}): Promise<ConversationRow> {
  const result = await supabase
    .from("ai_chat_conversations")
    .insert({
      user_id: userId,
      source_kind: sourceKind,
      source_id: sourceId,
      source_version: sourceVersion,
      title,
      provider,
      model,
      context_fingerprint: contextFingerprint
    })
    .select("id,user_id,source_kind,source_id,source_version,title,provider,model,context_fingerprint,created_at,updated_at")
    .single();
  if (result.error) throw result.error;
  return result.data as ConversationRow;
}

export async function getConversationMessages({
  supabase,
  userId,
  conversationId,
  limit = 100
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  limit?: number;
}): Promise<AiChatMessageView[]> {
  const result = await supabase
    .from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at,sequence")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("sequence", { ascending: true })
    .limit(Math.max(1, Math.min(500, limit)));
  if (result.error) throw result.error;
  return ((result.data ?? []) as MessageRow[]).map(mapMessage);
}

export async function getRecentConversationMessages({
  supabase,
  userId,
  conversationId,
  limit = 40
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  limit?: number;
}): Promise<AiChatMessageView[]> {
  const result = await supabase
    .from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at,sequence")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("sequence", { ascending: false })
    .limit(Math.max(1, Math.min(80, limit)));
  if (result.error) throw result.error;
  return ((result.data ?? []) as MessageRow[]).reverse().map(mapMessage);
}

async function findMessage({
  supabase,
  userId,
  conversationId,
  requestId,
  role
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  requestId: string;
  role: AiChatMessageRole;
}): Promise<MessageRow | null> {
  const result = await supabase
    .from("ai_chat_messages")
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .eq("request_id", requestId)
    .eq("role", role)
    .maybeSingle();
  if (result.error) throw result.error;
  return (result.data as MessageRow | null) ?? null;
}

export async function appendMessage({
  supabase,
  userId,
  conversationId,
  requestId,
  role,
  content,
  status,
  provider,
  model
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  requestId: string;
  role: AiChatMessageRole;
  content: string;
  status: AiChatMessageStatus;
  provider?: string | null;
  model?: string | null;
}): Promise<AiChatMessageView> {
  const existing = await findMessage({
    supabase,
    userId,
    conversationId,
    requestId,
    role
  });
  if (existing) return mapMessage(existing);

  const result = await supabase
    .from("ai_chat_messages")
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      request_id: requestId,
      role,
      content,
      status,
      provider: provider ?? null,
      model: model ?? null
    })
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at")
    .single();

  if (!result.error) return mapMessage(result.data as MessageRow);

  // A replay may race the original insert. Resolve the unique row rather than
  // duplicating the learner message or assistant response.
  const raced = await findMessage({
    supabase,
    userId,
    conversationId,
    requestId,
    role
  });
  if (raced) return mapMessage(raced);
  throw result.error;
}

export async function saveAssistantMessage({
  supabase,
  userId,
  conversationId,
  requestId,
  content,
  status,
  provider,
  model
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  requestId: string;
  content: string;
  status: AiChatMessageStatus;
  provider: string;
  model: string;
}): Promise<AiChatMessageView> {
  const existing = await findMessage({
    supabase,
    userId,
    conversationId,
    requestId,
    role: "assistant"
  });

  if (!existing) {
    return appendMessage({
      supabase,
      userId,
      conversationId,
      requestId,
      role: "assistant",
      content,
      status,
      provider,
      model
    });
  }

  const result = await supabase
    .from("ai_chat_messages")
    .update({ content, status, provider, model })
    .eq("id", existing.id)
    .eq("user_id", userId)
    .select("id,conversation_id,user_id,request_id,role,content,status,provider,model,created_at")
    .single();
  if (result.error) throw result.error;
  return mapMessage(result.data as MessageRow);
}

export async function getCompletedAssistantForRequest({
  supabase,
  userId,
  conversationId,
  requestId
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
  requestId: string;
}): Promise<AiChatMessageView | null> {
  const existing = await findMessage({
    supabase,
    userId,
    conversationId,
    requestId,
    role: "assistant"
  });
  return existing?.status === "complete" ? mapMessage(existing) : null;
}

export async function deleteConversation({
  supabase,
  userId,
  conversationId
}: {
  supabase: SupabaseClient;
  userId: string;
  conversationId: string;
}): Promise<void> {
  const result = await supabase
    .from("ai_chat_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);
  if (result.error) throw result.error;
}

export async function deleteItemConversations({
  supabase,
  userId,
  sourceKind,
  sourceId
}: {
  supabase: SupabaseClient;
  userId: string;
  sourceKind: AiChatSourceKind;
  sourceId: string;
}): Promise<void> {
  const result = await supabase
    .from("ai_chat_conversations")
    .delete()
    .eq("user_id", userId)
    .eq("source_kind", sourceKind)
    .eq("source_id", sourceId);
  if (result.error) throw result.error;
}

export async function consumeAiChatQuota({
  supabase,
  inputChars,
  maxRequests,
  maxInputChars
}: {
  supabase: SupabaseClient;
  inputChars: number;
  maxRequests: number;
  maxInputChars: number;
}): Promise<AiChatQuota> {
  const result = await supabase.rpc("consume_ai_chat_quota", {
    p_input_chars: Math.max(0, Math.trunc(inputChars)),
    p_max_requests: Math.max(1, Math.trunc(maxRequests)),
    p_max_input_chars: Math.max(1, Math.trunc(maxInputChars))
  });
  if (result.error) throw result.error;
  const value =
    typeof result.data === "object" && result.data !== null
      ? (result.data as Record<string, unknown>)
      : {};
  return {
    allowed: value.allowed === true,
    requestCount: typeof value.request_count === "number" ? value.request_count : 0,
    inputChars: typeof value.input_chars === "number" ? value.input_chars : 0
  };
}

export async function recordAiChatOutput({
  supabase,
  outputChars
}: {
  supabase: SupabaseClient;
  outputChars: number;
}): Promise<void> {
  const result = await supabase.rpc("record_ai_chat_output", {
    p_output_chars: Math.max(0, Math.trunc(outputChars))
  });
  if (result.error) throw result.error;
}
