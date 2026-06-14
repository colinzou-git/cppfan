import { getBuildInfo } from "@/lib/build-info/build-info";

/**
 * Globally visible, unobtrusive build-info footer (#191). Server-rendered from
 * build-time injected metadata so it is deterministic (no hydration mismatch)
 * and immutable for a given deployment. Shows version, short commit SHA (linked
 * to the public GitHub commit when real), Pacific build time, and environment.
 */
export function BuildInfoFooter() {
  const info = getBuildInfo();

  return (
    <footer
      className="mx-auto w-full max-w-6xl px-4 py-3 text-center text-[11px] leading-5 text-slate-500 sm:px-6"
      data-testid="build-info"
    >
      <span className="break-words">
        {info.appName} v{info.version}
        {" · "}
        {info.commitUrl ? (
          <a
            href={info.commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline decoration-dotted underline-offset-2 hover:text-slate-700"
            data-testid="build-info-commit"
          >
            {info.shortSha}
          </a>
        ) : (
          <span className="font-mono" data-testid="build-info-commit">
            {info.shortSha}
          </span>
        )}
      </span>
      <span className="block sm:inline">
        <span className="hidden sm:inline">{" · "}</span>
        Built {info.builtAtPacific} · {info.environment}
      </span>
    </footer>
  );
}
