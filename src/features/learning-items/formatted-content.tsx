import type { ReactNode } from "react";

type ContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "code"; language: string; code: string }
  | { kind: "unordered-list"; items: string[] }
  | { kind: "ordered-list"; items: string[] }
  | { kind: "blockquote"; text: string };

const FENCE_RE = /^\s*```([A-Za-z0-9_+#.-]*)\s*$/;
const HEADING_RE = /^\s*(#{1,3})\s+(.+)$/;
const UNORDERED_ITEM_RE = /^\s*[-+*]\s+(.+)$/;
const ORDERED_ITEM_RE = /^\s*\d+\.\s+(.+)$/;
const BLOCKQUOTE_RE = /^\s*>\s?(.*)$/;

function normalizeMarkdownContent(content: string): string {
  return content
    .replace(/\\r\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n");
}

function startsBlock(line: string): boolean {
  return (
    FENCE_RE.test(line) ||
    HEADING_RE.test(line) ||
    UNORDERED_ITEM_RE.test(line) ||
    ORDERED_ITEM_RE.test(line) ||
    BLOCKQUOTE_RE.test(line)
  );
}

function parseBlocks(content: string): ContentBlock[] {
  const lines = normalizeMarkdownContent(content).split("\n");
  const blocks: ContentBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const fence = line.match(FENCE_RE);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ kind: "code", language: fence[1], code: codeLines.join("\n") });
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    const unordered = line.match(UNORDERED_ITEM_RE);
    if (unordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(UNORDERED_ITEM_RE);
        if (!item) {
          break;
        }
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ kind: "unordered-list", items });
      continue;
    }

    const ordered = line.match(ORDERED_ITEM_RE);
    if (ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(ORDERED_ITEM_RE);
        if (!item) {
          break;
        }
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ kind: "ordered-list", items });
      continue;
    }

    const quote = line.match(BLOCKQUOTE_RE);
    if (quote) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoted = lines[index].match(BLOCKQUOTE_RE);
        if (!quoted) {
          break;
        }
        quoteLines.push(quoted[1]);
        index += 1;
      }
      blocks.push({ kind: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() !== "" && !startsBlock(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-950"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function languageLabel(language: string): string {
  const normalized = language.toLowerCase();
  if (normalized === "cpp" || normalized === "c++" || normalized === "cxx") {
    return "C++";
  }
  return language;
}

export function FormattedContent({ content, className }: { content: string; className?: string }) {
  const blocks = parseBlocks(content);
  const rootClassName = ["grid gap-3 break-words", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            if (block.level === 1) {
              return (
                <h2 key={index} className="text-lg font-bold leading-7">
                  {renderInline(block.text)}
                </h2>
              );
            }
            if (block.level === 2) {
              return (
                <h3 key={index} className="text-base font-bold leading-6">
                  {renderInline(block.text)}
                </h3>
              );
            }
            return (
              <h4 key={index} className="font-bold leading-6">
                {renderInline(block.text)}
              </h4>
            );
          case "code":
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-50"
                data-testid="formatted-code-block"
              >
                {block.language ? (
                  <div className="border-b border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-300">
                    {languageLabel(block.language)}
                  </div>
                ) : null}
                <pre className="overflow-x-auto p-4 text-xs leading-5">
                  <code className="font-mono">{block.code}</code>
                </pre>
              </div>
            );
          case "unordered-list":
            return (
              <ul key={index} className="list-disc space-y-1 pl-5 leading-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5 leading-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "blockquote":
            return (
              <blockquote key={index} className="border-l-4 border-slate-300 pl-4 italic leading-6 text-slate-700">
                {renderInline(block.text)}
              </blockquote>
            );
          case "paragraph":
            return (
              <p key={index} className="leading-6">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
