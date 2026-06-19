# Measuring AI token savings

Use two separate measurements:

1. **Automatic navigation estimate** — compares compact code-index query output with the source files those results locate.
2. **Controlled provider comparison** — compares actual Claude session-token totals or Codex usage-percentage consumption across matched tasks.

## Automatic estimate

Refresh the index, then use it normally:

```bash
node scripts/ai/refresh-code-index.mjs manual --strict
node scripts/ai/query-code-index.mjs getExerciseById
node scripts/ai/query-code-index.mjs @/features/exercises --limit 10
```

Each query appends an event to:

```text
.ai/repo-map.token-metrics.jsonl
```

Generate the report:

```bash
node scripts/ai/token-savings-report.mjs
```

It reports compact query tokens, the matched-file read baseline, estimated tokens avoided, and estimated reduction percentage.

The estimate uses `characters / 4`. It is not a provider bill: tokenizers, prompt caching, tool protocols, and later intentional file reads vary.

Reset the observation window in PowerShell:

```powershell
Remove-Item .ai/repo-map.token-metrics.jsonl -ErrorAction SilentlyContinue
```

Disable logging temporarily:

```powershell
$env:CPPFAN_DISABLE_TOKEN_METRICS = "1"
```

## Controlled Claude comparison

Claude Code `/usage` reports detailed current-session token usage. For each variant:

1. Use the same model and settings.
2. Start a fresh session.
3. Use equivalent scope and acceptance criteria.
4. For the baseline, navigate without the index.
5. For the indexed variant, query the index before opening source files.
6. Run `/usage` and record the session token total.

```bash
node scripts/ai/record-ai-usage.mjs --task issue-123 --provider claude --variant baseline --value 42000 --unit tokens
node scripts/ai/record-ai-usage.mjs --task issue-123 --provider claude --variant indexed --value 27000 --unit tokens
node scripts/ai/token-savings-report.mjs
```

## Controlled Codex comparison

ChatGPT-plan Codex usage depends on task size, complexity, execution location, and retained context. When an exact per-session token total is unavailable, record percentage-point consumption from the Codex usage page before and after comparable tasks:

```bash
node scripts/ai/record-ai-usage.mjs --task issue-123 --provider codex --variant baseline --value 4.2 --unit plan-percent
node scripts/ai/record-ai-usage.mjs --task issue-123 --provider codex --variant indexed --value 2.8 --unit plan-percent
```

Do not convert plan percentage into tokens. Compare only the same provider and unit.

## Fair experiment design

Prefer at least three matched tasks per variant and alternate order. Keep model, reasoning effort, session freshness, plugins/MCP servers, repository revision, acceptance criteria, and validation commands constant. Use disposable branches or worktrees so variants start from the same commit.

A lower-token run that misses requirements is not a successful optimization. Evaluate correctness together with usage.
