import Link from "next/link";

export function AiChatLinks() {
  return <div><Link href="/tutor">AI Chat</Link><Link href="/tutor?mode=history">Chat history</Link></div>;
}
