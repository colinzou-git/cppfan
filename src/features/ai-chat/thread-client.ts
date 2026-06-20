"use client";

export async function loadThreads(kind: string, id: string) {
  const params = new URLSearchParams({ sourceKind: kind, sourceId: id });
  const path = ["/api", "/ai", "/chat"].join("");
  const response = await fetch(`${path}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Saved conversations are unavailable.");
  return response.json();
}
