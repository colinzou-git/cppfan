# Automated page QA

cppFan uses Playwright for browser-level QA. These tests are meant to catch UI and workflow problems that unit tests cannot see, such as inert buttons, editor cursor regressions, missing compile output, raw markdown showing in prose, layout overflow, and runtime console errors.

## Commands

Run the full browser suite:

    pnpm test:e2e

Run only the page crawler:

    pnpm test:e2e tests/e2e/page-audit.spec.ts

Run only the Code Lab workflow test:

    pnpm test:e2e tests/e2e/code-lab-qa.spec.ts

Run with the browser visible:

    pnpm test:e2e:headed

Open the Playwright report:

    pnpm test:e2e:report

## Page crawler

`tests/e2e/page-audit.spec.ts` opens important public pages at desktop, iPad, and iPhone viewport sizes. It checks that expected headings or test ids appear, that common buttons are visible and enabled, that the page has no meaningful horizontal overflow, and that rendered prose does not expose raw markdown artifacts outside code blocks.

## Code Lab workflow QA

`tests/e2e/code-lab-qa.spec.ts` checks the Code Lab workflow on the minimal C++ lesson. It first calls `/api/code/runner-health` and skips the Judge0 workflow when Judge0 is not configured or not reachable. When Judge0 is available, it verifies editor cursor stability, useful compile-error output, successful Run output, Run Tests results, and same-page `Open Code Lab` recommendation behavior.

## Shared helpers

`tests/e2e/helpers/page-audit.ts` contains the reusable Playwright helper for console/page/network diagnostics, horizontal overflow checks, raw-markdown checks, and Monaco editor helpers.

## Adding coverage

Add more public routes to `PUBLIC_PAGES` in `tests/e2e/page-audit.spec.ts`. Add more Code Lab item workflows to `tests/e2e/code-lab-qa.spec.ts`. Keep real-runner workflows behind the health check so the general page audit remains useful even without Judge0.
