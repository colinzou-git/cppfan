#!/usr/bin/env bash
set -euo pipefail

# Verify the configured Judge0 endpoint with the same request contract used by
# src/features/code-lab/code-runner-adapter.ts. This script never prints the
# authentication token or the full request headers.

: "${CODE_RUNNER_BASE_URL:?CODE_RUNNER_BASE_URL is required}"
: "${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID:?CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID is required}"

if [[ "${CODE_RUNNER_PROVIDER:-judge0}" != "judge0" ]]; then
  echo "CODE_RUNNER_PROVIDER must be judge0 for the real-runner preflight." >&2
  exit 1
fi

for command_name in curl jq base64; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "${command_name} is required for the Judge0 preflight." >&2
    exit 1
  fi
done

if ! [[ "${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID}" =~ ^[1-9][0-9]*$ ]]; then
  echo "CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID must be a positive integer." >&2
  exit 1
fi

base_url="${CODE_RUNNER_BASE_URL%/}"
case "${base_url}" in
  https://*|http://127.0.0.1:*|http://localhost:*) ;;
  http://*)
    echo "Warning: Judge0 is using public plain HTTP. Prefer HTTPS before enabling persistent CI use." >&2
    ;;
  *)
    echo "CODE_RUNNER_BASE_URL must begin with http:// or https://." >&2
    exit 1
    ;;
esac

headers=(--header "Accept: application/json")
if [[ -n "${CODE_RUNNER_API_KEY:-}" ]]; then
  headers+=(--header "X-Auth-Token: ${CODE_RUNNER_API_KEY}")
fi

languages_json="$(curl --fail --silent --show-error \
  "${headers[@]}" \
  "${base_url}/languages")"

if ! jq -e \
  --argjson language_id "${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID}" \
  'any(.[]; .id == $language_id and (.name | test("C\\+\\+"; "i")))' \
  >/dev/null <<<"${languages_json}"; then
  echo "Configured language id ${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID} is not a C++ language on this Judge0 endpoint." >&2
  echo "Available C++ languages:" >&2
  jq -r '.[] | select(.name | test("C\\+\\+"; "i")) | "  \(.id): \(.name)"' \
    <<<"${languages_json}" >&2
  exit 1
fi

source_b64="$(printf '%b' '#include <iostream>\nint main() { int a = 20; int b = 22; std::cout << (a + b) << "\\n"; }\n' | base64 | tr -d '\n')"
stdin_b64=""
request_json="$(jq -n \
  --argjson language_id "${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID}" \
  --arg source_code "${source_b64}" \
  --arg stdin "${stdin_b64}" \
  '{
    language_id: $language_id,
    source_code: $source_code,
    stdin: $stdin,
    cpu_time_limit: 5,
    wall_time_limit: 8,
    memory_limit: 131072
  }')"

submission_json="$(curl --fail --silent --show-error \
  --request POST \
  --header "Content-Type: application/json" \
  "${headers[@]}" \
  --data "${request_json}" \
  "${base_url}/submissions?base64_encoded=true&wait=true")"

status_id="$(jq -r '.status.id // 0' <<<"${submission_json}")"
token="$(jq -r '.token // empty' <<<"${submission_json}")"

if [[ "${status_id}" == "1" || "${status_id}" == "2" ]]; then
  if [[ -z "${token}" ]]; then
    echo "Judge0 returned a pending status without a submission token." >&2
    exit 1
  fi

  for _ in $(seq 1 30); do
    sleep 1
    submission_json="$(curl --fail --silent --show-error \
      "${headers[@]}" \
      "${base_url}/submissions/${token}?base64_encoded=true")"
    status_id="$(jq -r '.status.id // 0' <<<"${submission_json}")"
    if [[ "${status_id}" != "1" && "${status_id}" != "2" ]]; then
      break
    fi
  done
fi

status_description="$(jq -r '.status.description // "unknown"' <<<"${submission_json}")"
if [[ "${status_id}" != "3" ]]; then
  echo "Judge0 compile/run preflight failed with status: ${status_description}." >&2
  compile_output="$(jq -r '.compile_output // empty' <<<"${submission_json}" | base64 --decode 2>/dev/null || true)"
  stderr_output="$(jq -r '.stderr // empty' <<<"${submission_json}" | base64 --decode 2>/dev/null || true)"
  [[ -n "${compile_output}" ]] && printf 'Compile output:\n%s\n' "${compile_output}" >&2
  [[ -n "${stderr_output}" ]] && printf 'Stderr:\n%s\n' "${stderr_output}" >&2
  exit 1
fi

stdout_b64="$(jq -r '.stdout // empty' <<<"${submission_json}")"
stdout_text="$(printf '%s' "${stdout_b64}" | base64 --decode)"
if [[ "${stdout_text}" != "42" ]]; then
  echo "Judge0 returned Accepted but stdout was not the expected value 42." >&2
  exit 1
fi

echo "Judge0 real C++ compile/run verified: language=${CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID}, status=Accepted, stdout=42."
