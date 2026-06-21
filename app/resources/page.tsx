import Link from "next/link";
import { ExternalLink, Library } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  externalResources,
  type ResourceKind
} from "@/features/resources/resource-catalog";

const KIND_ORDER: { kind: ResourceKind; label: string }[] = [
  { kind: "tutorial", label: "Tutorials" },
  { kind: "reference", label: "References" },
  { kind: "guidelines", label: "Guidelines" },
  { kind: "practice", label: "Practice" },
  { kind: "project", label: "Projects" }
];

export default function ResourcesPage() {
  return (
    <PageShell className="grid gap-6" size="wide">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Library className="h-7 w-7 text-blue-700" />
          C++ &amp; DSA resources
        </h1>
        <p className="mt-1 text-slate-600">
          A curated set of high-quality external resources. cppFan links out rather than copying them.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {KIND_ORDER.map(({ kind, label }) => {
        const items = externalResources.filter((resource) => resource.kind === kind);
        if (items.length === 0) {
          return null;
        }
        return (
          <Card key={kind} className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="resource-group">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <ul className="grid gap-2">
                {items.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="resource-link"
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/60"
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{resource.name}</span>
                        <span className="block text-xs font-medium text-slate-500">{resource.description}</span>
                      </span>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
      </section>
    </PageShell>
  );
}
