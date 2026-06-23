import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

type AuditOptions = {
  allowConsole?: RegExp[];
  allowNetwork?: RegExp[];
};

type PageProblem = {
  kind: "console" | "pageerror" | "network";
  message: string;
};

const DEFAULT_ALLOWED_CONSOLE = [
  /ResizeObserver loop limit exceeded/i,
  /ResizeObserver loop completed with undelivered notifications/i,
  /Failed to load resource: the server responded with a status of 404/i
];

const DEFAULT_ALLOWED_NETWORK = [
  /\/favicon\.ico$/i,
  /\/apple-touch-icon/i,
  /\/manifest\.json$/i,
  /\/api\/ai\//i,
  /\/api\/code\/review/i,
  /\/api\/code\/trace/i
];

/**
 * Attach one lightweight QA harness to a page. The returned assert function fails
 * the test after the interaction completes, which produces clearer failures than
 * throwing directly inside event handlers.
 */
export function attachPageAudit(page: Page, testInfo: TestInfo, options: AuditOptions = {}) {
  const problems: PageProblem[] = [];
  const allowedConsole = [...DEFAULT_ALLOWED_CONSOLE, ...(options.allowConsole ?? [])];
  const allowedNetwork = [...DEFAULT_ALLOWED_NETWORK, ...(options.allowNetwork ?? [])];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (allowedConsole.some((pattern) => pattern.test(text))) return;
    problems.push({ kind: "console", message: text });
  });

  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (allowedConsole.some((pattern) => pattern.test(text))) return;
    problems.push({ kind: "pageerror", message: text });
  });

  page.on("response", (response) => {
    const status = response.status();
    if (status < 500) return;
    const url = response.url();
    if (allowedNetwork.some((pattern) => pattern.test(url))) return;
    problems.push({ kind: "network", message: `${status} ${url}` });
  });

  return async function assertPageAuditClean() {
    await expectNoHorizontalOverflow(page);
    if (problems.length === 0) return;

    await testInfo.attach("page-audit-problems", {
      body: problems.map((problem) => `${problem.kind}: ${problem.message}`).join("\n\n"),
      contentType: "text/plain"
    });

    expect(problems, "page audit collected console/page/network failures").toEqual([]);
  };
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const element = document.documentElement;
    return Math.max(0, element.scrollWidth - element.clientWidth);
  });
  expect(overflow, "page should not have meaningful horizontal overflow").toBeLessThanOrEqual(8);
}

export async function expectNoRawMarkdownArtifacts(page: Page, root?: Locator) {
  const text = root
    ? await root.evaluate((element) => visibleTextWithoutCode(element))
    : await page.evaluate(() => visibleTextWithoutCode(document.body));

  const artifacts = [
    { name: "triple backtick code fence", pattern: /```/ },
    { name: "raw bold markdown", pattern: /(^|\s)\*\*[^*\n]{2,}\*\*(\s|$|[.,;:!?])/ },
    { name: "escaped markdown newline heading", pattern: /\\n#{1,6}\s/ }
  ];

  for (const artifact of artifacts) {
    expect(text, `rendered page should not expose ${artifact.name}`).not.toMatch(artifact.pattern);
  }
}

export async function expectVisibleAndEnabled(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
}

export async function setMonacoValue(page: Page, value: string) {
  await waitForCodeLabEditor(page);
  await page.evaluate((nextValue) => {
    const editor = (window as unknown as { __cppfanCodeLabEditor?: { setValue(value: string): void } })
      .__cppfanCodeLabEditor;
    editor?.setValue(nextValue);
  }, value);
}

export async function getMonacoValue(page: Page): Promise<string> {
  await waitForCodeLabEditor(page);
  return page.evaluate(() => {
    const editor = (window as unknown as { __cppfanCodeLabEditor?: { getValue(): string } }).__cppfanCodeLabEditor;
    return editor?.getValue() ?? "";
  });
}

export async function focusMonacoAt(page: Page, lineNumber: number, column: number) {
  await waitForCodeLabEditor(page);
  await page.evaluate(
    ({ lineNumber: line, column: col }) => {
      const editor = (window as unknown as {
        __cppfanCodeLabEditor?: {
          focus(): void;
          setPosition(position: { lineNumber: number; column: number }): void;
        };
      }).__cppfanCodeLabEditor;
      editor?.focus();
      editor?.setPosition({ lineNumber: line, column: col });
    },
    { lineNumber, column }
  );
}

async function waitForCodeLabEditor(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __cppfanCodeLabEditor?: unknown }).__cppfanCodeLabEditor));
}

function visibleTextWithoutCode(root: Element): string {
  const clone = root.cloneNode(true) as Element;
  clone
    .querySelectorAll("script,style,pre,code,textarea,.monaco-editor,[data-testid='code-editor']")
    .forEach((node) => node.remove());
  return clone.textContent ?? "";
}
