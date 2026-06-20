import Link from "next/link";
import { normalizeAiChatContext } from "@/features/ai-chat/ai-chat-context";
import { TutorWorkspace } from "@/features/ai-chat/tutor-workspace";

export default async function TutorPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawContext = Array.isArray(params.context) ? params.context[0] : params.context;
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  let parsed: unknown = null;
  try {
    parsed = rawContext ? JSON.parse(rawContext) : null;
  } catch {
    parsed = null;
  }
  const context = normalizeAiChatContext(parsed);

  if (!context.ok) {
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

  return <TutorWorkspace context={context.value} initialMode={rawMode === "history" ? "history" : "conversation"} />;
}
