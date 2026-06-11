import { Suspense } from "react";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-4 py-10">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur">
        <p className="text-sm font-bold text-slate-600">Loading login...</p>
      </div>
    </main>
  );
}
