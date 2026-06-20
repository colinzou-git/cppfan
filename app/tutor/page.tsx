import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizeAiChatContext } from "@/features/ai-chat/ai-chat-context";
import { listItemConversations } from "@/features/ai-chat/ai-chat-store";
import { TutorConversation } from "@/features/ai-chat/tutor-conversation";
import { tutorUrl } from "@/features/ai-chat/tutor-url";

export default async function TutorPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawContext = Array.isArray(params.context) ? params.context[0] : params.context;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const requestedConversation = Array.isArray(params.conversation) ? params.conversation[0] : params.conversation;
  const fresh = (Array.isArray(params.fresh) ? params.fresh[0] : params.fresh) === "1";
  let decoded: unknown = null;
  try {
    decoded = rawContext ? JSON.parse(rawContext) : null;
  } catch {}
  const parsed = normalizeAiChatContext(decoded);

  if (!parsed.ok) {
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-4 py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">AI Chat</h1>
          <p className="mt-3 text-sm text-slate-700">This item context is missing or no longer valid. Return to the learning activity and open AI Chat again.</p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">Return to cppFan</Link>
        </section>
      </main>
    );
  }

  const context = parsed.value;
  if (mode !== "history") {
    return <TutorConversation context={context} requestedConversation={requestedConversation} fresh={fresh} />;
  }

  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const conversations = supabase && user
    ? await listItemConversations({
        supabase,
        userId: user.id,
        sourceKind: context.sourceKind,
        sourceId: context.sourceId
      }).catch(() => [])
    : [];
  const returnTo = tutorUrl(context, { mode: "history" });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">Chat history</p>
        <h1 className="text-2xl font-black text-slate-950">{context.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Only your saved conversations for this item are shown.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={tutorUrl(context, { fresh: true })} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white">New chat</Link>
          {conversations.length ? (
            <form method="post" action="/api/ai/chat/delete">
              <input type="hidden" name="allForItem" value="true" />
              <input type="hidden" name="sourceKind" value={context.sourceKind} />
              <input type="hidden" name="sourceId" value={context.sourceId} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="submit" value="Delete all for this item" className="cursor-pointer rounded-lg border border-rose-300 px-3 py-2 text-sm font-bold text-rose-700" />
            </form>
          ) : null}
        </div>
      </header>
      {!user ? <p className="border-x border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Sign in to view saved AI Chat history.</p> : null}
      <section className="space-y-4 rounded-b-2xl border border-t-0 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {!conversations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No saved AI chats for this item yet.</p> : null}
        {conversations.map((conversation) => (
          <article key={conversation.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">{conversation.title}</h2>
                <p className="text-xs text-slate-500">{new Date(conversation.updatedAt).toLocaleString()} · {conversation.messages.length} messages{conversation.model ? ` · ${conversation.model}` : ""}</p>
                {conversation.sourceVersion !== context.sourceVersion ? <p className="text-xs font-semibold text-amber-700">Older item version: {conversation.sourceVersion}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={tutorUrl(context, { conversation: conversation.id })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">{conversation.sourceVersion === context.sourceVersion ? "Resume" : "View"}</Link>
                <form method="post" action="/api/ai/chat/delete">
                  <input type="hidden" name="conversationId" value={conversation.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="submit" value="Delete" className="cursor-pointer rounded-lg px-3 py-2 text-sm font-bold text-rose-700" />
                </form>
              </div>
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
              {conversation.messages.map((entry) => <p key={entry.id} className="whitespace-pre-wrap break-words text-sm"><strong>{entry.role === "user" ? "You" : "AI"}:</strong> {entry.content || `(${entry.status})`}</p>)}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
