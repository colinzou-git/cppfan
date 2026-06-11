import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-600">This cppFan route does not exist yet.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
