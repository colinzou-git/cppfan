#!/usr/bin/env bash
set -euo pipefail

: "${CODE_TERMINAL_BASE_URL:?CODE_TERMINAL_BASE_URL is required}"
: "${CODE_TERMINAL_API_KEY:?CODE_TERMINAL_API_KEY is required}"

for command_name in curl jq base64; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "${command_name} is required for the Terminal preflight." >&2
    exit 1
  fi
done

if [[ "${CI:-}" == "true" ]]; then
  case "${CODE_TERMINAL_BASE_URL%/}" in
    http://127.0.0.1:*|http://localhost:*) ;;
    *)
      echo "CI must reach the Terminal service through a loopback SSH forward." >&2
      exit 1
      ;;
  esac
fi

session_id=""
session_token=""
cursor=0
transcript=""
terminal_status=""
terminal_exit_code=""

api_get() {
  curl --fail --silent --show-error \
    --connect-timeout 3 --max-time 10 \
    "${CODE_TERMINAL_BASE_URL%/}$1"
}

api_post() {
  curl --fail --silent --show-error \
    --connect-timeout 3 --max-time 15 \
    -H "Authorization: Bearer ${CODE_TERMINAL_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$2" \
    "${CODE_TERMINAL_BASE_URL%/}$1"
}

cleanup() {
  if [[ -n "${session_id}" && -n "${session_token}" ]]; then
    stop_body="$(jq -n \
      --arg sessionId "${session_id}" \
      --arg sessionToken "${session_token}" \
      '{sessionId:$sessionId,sessionToken:$sessionToken}')"
    api_post /terminal/stop "${stop_body}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

reset_session() {
  session_id=""
  session_token=""
  cursor=0
  transcript=""
  terminal_status=""
  terminal_exit_code=""
}

start_session() {
  local source="$1"
  local files_json="${2:-[]}"
  reset_session
  local start_body
  local start
  start_body="$(jq -n \
    --arg source "${source}" \
    --argjson files "${files_json}" \
    '{
      source: $source,
      stdin: "",
      files: $files,
      compilerFlags: ["-std=c++20", "-Wall", "-Wextra", "-Wpedantic", "-O0"]
    }')"
  start="$(api_post /terminal/start "${start_body}")"
  session_id="$(jq -r '.sessionId // empty' <<<"${start}")"
  session_token="$(jq -r '.sessionToken // empty' <<<"${start}")"
  [[ -n "${session_id}" && -n "${session_token}" ]]
  terminal_status="$(jq -r '.status // empty' <<<"${start}")"
  terminal_exit_code="$(jq -r '.exitCode // empty' <<<"${start}")"
  cursor="$(jq -r '.nextSequence // 0' <<<"${start}")"
  transcript="$(jq -r '[.events[]?.text] | join("")' <<<"${start}")"
}

poll_once() {
  local poll_body
  local snapshot
  poll_body="$(jq -n \
    --arg sessionId "${session_id}" \
    --arg sessionToken "${session_token}" \
    --argjson after "${cursor}" \
    '{sessionId:$sessionId,sessionToken:$sessionToken,after:$after}')"
  snapshot="$(api_post /terminal/poll "${poll_body}")"
  terminal_status="$(jq -r '.status // empty' <<<"${snapshot}")"
  terminal_exit_code="$(jq -r '.exitCode // empty' <<<"${snapshot}")"
  cursor="$(jq -r '.nextSequence // 0' <<<"${snapshot}")"
  transcript+=$(jq -r '[.events[]?.text] | join("")' <<<"${snapshot}")
}

wait_for_text() {
  local expected="$1"
  for _ in $(seq 1 80); do
    [[ "${transcript}" == *"${expected}"* ]] && return 0
    poll_once
    sleep 0.25
  done
  echo "Terminal preflight did not observe an expected transcript marker." >&2
  return 1
}

wait_for_status() {
  local expected="$1"
  for _ in $(seq 1 80); do
    [[ "${terminal_status}" == "${expected}" ]] && return 0
    poll_once
    sleep 0.25
  done
  echo "Terminal preflight did not reach ${expected}." >&2
  return 1
}

send_input() {
  local data="$1"
  local body
  body="$(jq -n \
    --arg sessionId "${session_id}" \
    --arg sessionToken "${session_token}" \
    --arg data "${data}" \
    '{sessionId:$sessionId,sessionToken:$sessionToken,data:$data}')"
  api_post /terminal/input "${body}" >/dev/null
}

send_eof() {
  local body
  body="$(jq -n \
    --arg sessionId "${session_id}" \
    --arg sessionToken "${session_token}" \
    '{sessionId:$sessionId,sessionToken:$sessionToken,eof:true}')"
  api_post /terminal/input "${body}" >/dev/null
}

health="$(api_get /health)"
jq -e '.status == "ok"' <<<"${health}" >/dev/null

read -r -d '' multi_source <<'CPP' || true
#include <iostream>
#include <string>
int main() {
  std::string first;
  std::string second;
  std::cout << "first>" << std::flush;
  std::getline(std::cin, first);
  std::cout << "one:" << first << "\nsecond>" << std::flush;
  std::getline(std::cin, second);
  std::cout << "two:" << second << "\n";
  while (std::getline(std::cin, first)) {}
  std::cout << "eof\n";
}
CPP

start_session "${multi_source}"
wait_for_text "first>"
send_input $'hello with spaces\n'
wait_for_text "one:hello with spaces"
wait_for_text "second>"
send_input $'\n'
wait_for_text "two:"
send_eof
wait_for_status "exited"
[[ "${terminal_exit_code}" == "0" ]]
[[ "${transcript}" == *"eof"* ]]
session_id=""
session_token=""

read -r -d '' fixture_source <<'CPP' || true
#include <fstream>
#include <iostream>
#include <string>
int main() {
  std::ifstream file("fixtures/message.txt");
  std::string value;
  std::getline(file, value);
  std::cout << value;
}
CPP
fixture_files='[{"name":"fixtures/message.txt","content":"fixture-ok"}]'
start_session "${fixture_source}" "${fixture_files}"
wait_for_status "exited"
[[ "${terminal_exit_code}" == "0" ]]
[[ "${transcript}" == *"fixture-ok"* ]]
session_id=""
session_token=""

read -r -d '' stop_source <<'CPP' || true
#include <chrono>
#include <thread>
int main() {
  for (;;) std::this_thread::sleep_for(std::chrono::milliseconds(100));
}
CPP
start_session "${stop_source}"
stop_body="$(jq -n \
  --arg sessionId "${session_id}" \
  --arg sessionToken "${session_token}" \
  '{sessionId:$sessionId,sessionToken:$sessionToken}')"
api_post /terminal/stop "${stop_body}" >/dev/null
wait_for_status "stopped"
[[ "${transcript}" == *"stopped by you"* ]]
session_id=""
session_token=""

summary=$'health=ok\nmulti_input=ok\nempty_line=ok\neof=ok\nfixture=ok\nstop=ok\n'
if [[ -n "${RUNNER_TEMP:-}" ]]; then
  printf '%s' "${summary}" >"${RUNNER_TEMP}/terminal-preflight-summary.txt"
fi
printf '%s' "${summary}"
