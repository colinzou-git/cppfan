// GitHub Action entrypoint for the closure guard (#147).
//
// Two roles, selected by event:
//  - issues.closed: if the issue is completion-tracked and not allowed to close
//    (unchecked boxes / "still open" comment / no final audit), REOPEN it and
//    comment the reasons.
//  - pull_request: advisory check of the PR body — a `partial` PR that uses a
//    closing keyword (Closes/Fixes/Resolves #N) fails the job.
//
// Dependency-free; uses the REST API via global fetch with the workflow
// GITHUB_TOKEN. It only reads PR/issue TEXT — it never checks out or executes PR
// code, so it is safe to run on the `pull_request` trigger (not pull_request_target).

import { readFileSync } from "node:fs";
import {
  evaluateIssueClosure,
  evaluatePullRequestClosure,
  isCompletionTracked,
  parsePrCompletion,
  referencedIssueNumbers
} from "./closure-guard.mjs";

function readEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) throw new Error("GITHUB_EVENT_PATH is not set");
  return JSON.parse(readFileSync(path, "utf8"));
}

async function gh(pathname, { method = "GET", body } = {}) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const res = await fetch(`https://api.github.com/repos/${repo}${pathname}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`GitHub API ${method} ${pathname} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function getIssue(number) {
  const issue = await gh(`/issues/${number}`);
  return {
    number: issue.number,
    title: issue.title ?? "",
    labels: issue.labels ?? [],
    body: issue.body ?? ""
  };
}

async function getClosingPrCompletion(issueNumber) {
  const timeline = await gh(`/issues/${issueNumber}/timeline?per_page=100`);
  const closingEvent = [...timeline].reverse().find((event) => event.event === "closed");
  const sourceIssue = closingEvent?.source?.issue;
  if (!sourceIssue?.pull_request || !sourceIssue.number) {
    return null;
  }
  const pr = await gh(`/pulls/${sourceIssue.number}`);
  return parsePrCompletion(pr.body ?? "");
}

async function handleIssueClosed(event) {
  const issue = event.issue;
  if (!issue || issue.pull_request) return; // ignore PR "issues"
  const completionTracked = isCompletionTracked({
    title: issue.title,
    labels: issue.labels ?? [],
    body: issue.body ?? ""
  });
  if (!completionTracked) {
    console.log(`#${issue.number} is a focused issue; closure allowed.`);
    return;
  }

  const commentsJson = await gh(`/issues/${issue.number}/comments?per_page=100`);
  const comments = commentsJson.map((c) => c.body ?? "");

  const { allowed, violations } = evaluateIssueClosure({
    body: issue.body ?? "",
    comments,
    completionTracked: true,
    linkedPrCompletion: await getClosingPrCompletion(issue.number)
  });

  if (allowed) {
    console.log(`#${issue.number} satisfies the closure guard; staying closed.`);
    return;
  }

  const reasons = violations.map((v) => `- ${v}`).join("\n");
  await gh(`/issues/${issue.number}/comments`, {
    method: "POST",
    body: {
      body:
        `⚠️ **Closure guard reopened this completion-tracked issue** (#147).\n\n` +
        `It was closed before its full scope was verified:\n\n${reasons}\n\n` +
        `Use \`Part of #${issue.number}\` for partial work, and post a \`## Final closure audit\` ` +
        `mapping every acceptance criterion to evidence before closing. See CLAUDE.md.`
    }
  });
  await gh(`/issues/${issue.number}`, { method: "PATCH", body: { state: "open" } });
  console.log(`Reopened #${issue.number}: ${violations.length} violation(s).`);
}

async function handlePullRequest(event) {
  const pr = event.pull_request;
  if (!pr) return;
  const body = pr.body ?? "";
  const referencedIssues = await Promise.all(referencedIssueNumbers(body).map((number) => getIssue(number)));
  const { allowed, violations, completion } = evaluatePullRequestClosure({ body, referencedIssues });
  if (!allowed) {
    console.error(`Closure-guard FAIL:\n${violations.map((v) => `- ${v}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PR #${pr.number} closure declaration OK (completion=${completion ?? "unset"}).`);
}

async function main() {
  const eventName = process.env.GITHUB_EVENT_NAME;
  const event = readEvent();
  if (eventName === "issues") {
    await handleIssueClosed(event);
  } else if (eventName === "pull_request" || eventName === "pull_request_target") {
    await handlePullRequest(event);
  } else {
    console.log(`closure-guard: no action for event ${eventName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
