#!/usr/bin/env bash
# Read-only VPS diagnostics for real-service E2E preflight failures.
# Never print API keys, authorization headers, request bodies or service logs.
set -euo pipefail

mode="${1:-}"
case "${mode}" in
  judge0)
    key="${CPPFAN_JUDGE0_SSH_KEY:-}"
    hosts="${CPPFAN_JUDGE0_KNOWN_HOSTS:-}"
    ;;
  terminal)
    key="${CPPFAN_REAL_SSH_KEY:-}"
    hosts="${CPPFAN_REAL_KNOWN_HOSTS:-}"
    ;;
  *)
    echo "Usage: diagnose-remote-services.sh judge0|terminal" >&2
    exit 2
    ;;
esac

: "${VPS_SSH_HOST:?missing VPS_SSH_HOST}"
: "${VPS_SSH_USER:?missing VPS_SSH_USER}"
: "${VPS_JUDGE0_PORT:?missing VPS_JUDGE0_PORT}"
: "${key:?missing SSH key path}"
: "${hosts:?missing SSH known-hosts path}"
terminal_port="${VPS_TERMINAL_PORT:-3008}"
for port in "${VPS_JUDGE0_PORT}" "${terminal_port}"; do
  if ! [[ "${port}" =~ ^[0-9]{1,5}$ ]]; then
    echo "VPS port must be numeric." >&2
    exit 2
  fi
done

echo "Running read-only remote port and service health diagnostics."
ssh -i "${key}" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="${hosts}" \
  -o PasswordAuthentication=no \
  -o ConnectTimeout=8 \
  "${VPS_SSH_USER}@${VPS_SSH_HOST}" \
  "bash -s -- '${VPS_JUDGE0_PORT}' '${terminal_port}'" <<'REMOTE'
set -uo pipefail
judge_port="$1"
terminal_port="$2"

echo "Remote listening loopback ports:"
ss -ltn 2>/dev/null | awk 'NR == 1 || /:2358[[:space:]]|:3008[[:space:]]|:3009[[:space:]]/' || true

echo "Remote unauthenticated HTTP status (no response bodies):"
for probe in "${judge_port}:/languages" "${terminal_port}:/health" "3008:/health" "3009:/health"; do
  port="${probe%%:*}"
  path="${probe#*:}"
  status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 2 --max-time 4 \
    "http://127.0.0.1:${port}${path}" 2>/dev/null || true)"
  printf '127.0.0.1:%s%s -> HTTP %s\n' "${port}" "${path}" "${status:-unreachable}"
done

if command -v docker >/dev/null 2>&1; then
  echo "Docker container names and health/status (no logs or environment values):"
  docker ps --format '{{.Names}}: {{.Status}}' 2>/dev/null || true
fi

for service in cppfan-gdb-debugger cppfan-terminal judge0; do
  status="$(systemctl is-active "${service}" 2>/dev/null || true)"
  printf 'systemd %s: %s\n' "${service}" "${status:-unknown}"
done
REMOTE
