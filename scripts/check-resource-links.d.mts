// Type declarations for the resource-link checker (#176) so its pure helpers can
// be imported from the TypeScript test suite.

export type LinkVerdict = "ok" | "stale" | "unverified";

export function collectResourceUrls(sources?: string[]): Promise<string[]>;

export function classifyStatus(status: number): LinkVerdict;
