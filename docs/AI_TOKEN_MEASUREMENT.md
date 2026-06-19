# Measuring AI token savings

The repository supports two complementary measurements. Keep them separate:

1. **Automatic navigation estimate** — measures how compact code-index query output is compared with reading the matched source files.
2. **Controlled provider comparison** — records actual Claude session tokens or Codex plan-percentage consumption from comparable runs.

The automatic estimate is useful every day. The controlled comparison is the stronger evidence, but requires matched tasks or an A/B experiment.

## Automatic navigation estimate

Build or refresh the index:

```bash
node scripts/ai/refresh-code-index.mjs manual --strict
```

Use the query command normally:

```bash
node scripts/ai/query-code-index.mjs getExerciseById
node scripts/ai/query-code-index.mjs @/features/exercises --limit 10
```

Each query appends an event to:

```text
.ai/repo-map.token-metrics.jsonl
```

Generate a report:

```bash
node scripts/ai/token-savings-report.mjs
```

The report shows:

- estimated tokens in the compact query results;
- estimated tokens in the matched source files;
- estimated tokens avoided;
- estimated reduction percentage.

The estimate uses `characters / 4`. It is intentionally labeled as an estimate because Claude and Codex use provider-specific tokenizers, prompt caching, tool protocols, and context management. It also does not subtract files the agent deliberately opens after locating them.

To start a new observation window:

```powershell
Remove-Item .ai/repo-map.token-metrics.jsonl -ErrorAction SilentlyContinue
```

Disable query logging temporarily:

```powershell
$env:CPPFAN_DISABLE_TOKEN_METRICS = "1"
```

## Controlled Claude comparison

Claude Code's `/usage` screen reports detailed current-session token usage. For a useful comparison:

1. Use the same Claude model and settings.
2. Start each variant in a fresh session.
3. Use equivalent issue scope and acceptance criteria.
4. In the baseline variant, do not use the code index; allow normal broad search/navigation.
5. In the indexed variant, query the code index before opening source files.
6. Run `/usage` at the end and record the session token total.

Record both values:

```bash
node scripts/ai/record-ai-usage.mjs \
  --task issue-123 \
  --provider claude \
  --variant baseline \
  --value 42000 \
  --unit tokens

node scripts/ai/record-ai-usage.mjs \
  --task issue-123 \
  --provider claude \
  --variant indexed \
  --value 27000 \
  --unit tokens
```

Then run:

```bash
node scripts/ai/token-savings-report.mjs
```

## Controlled Codex comparison

ChatGPT-plan Codex usage depends on task size, complexity, execution location, and how much context Codex must hold. The plan usage page does not necessarily expose an exact per-session token total. Record the **percentage-point consumption** shown by the Codex usage page before and after a matched task instead:

```bash
node scripts/ai/record-ai-usage.mjs \
  --task issue-123 \
  --provider codex \
  --variant baseline \
  --value 4.2 \
  --unit plan-percent

node scripts/ai/record-ai-usage.mjs \
  --task issue-123 \
  --provider codex \
  --variant indexed \
  --value 2.8 \
  --unit plan-percent
```

Do not convert plan percentage into tokens. Compare only records with the same provider and unit.

## Designing a fair experiment

One duplicated issue is noisy. Prefer at least three matched tasks in each variant and alternate the order:

```text
Task A: baseline
Task B: indexed
Task C: indexed
Task D: baseline
```

Keep constant where practical:

- model;
- reasoning effort;
- session freshness;
- enabled MCP servers/plugins;
- acceptance criteria;
- validation commands;
- repository revision.

Use disposable branches or worktrees so both variants begin from the same commit. Evaluate correctness as well as usage; a lower-token run that misses requirements is not a successful optimization.

## Interpreting the report

- **Estimated navigation reduction** answers: "How much smaller were index query results than the source files they located?"
- **Claude token comparison** answers: "How many fewer session tokens did comparable Claude runs use?"
- **Codex plan comparison** answers: "How many fewer usage percentage points did comparable Codex runs consume?"

Only the controlled provider comparison estimates end-to-end savings. The navigation metric explains why savings occurred and can be collected continuously without repeating work.
