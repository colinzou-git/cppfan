import type { Page } from "@playwright/test";

const IGNORED_CONSOLE_ERRORS = [/Failed to load resource/i];

export function monitorBrowserErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (!IGNORED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) {
      consoleErrors.push(text);
    }
  });

  return {
    assertNoErrors() {
      if (pageErrors.length > 0 || consoleErrors.length > 0) {
        throw new Error(
          [
            ...pageErrors.map((message) => `pageerror: ${message}`),
            ...consoleErrors.map((message) => `console.error: ${message}`)
          ].join("\n")
        );
      }
    }
  };
}
