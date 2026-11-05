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

echo "Runner-side forwarded health: compare proxy policy vs direct localhost."
# Include authenticated Judge0 probes, but print ONLY numeric HTTP status.
# A 200 with --noproxy and 500 without indicates an unwanted runner proxy.
for route in proxy direct; do
  opts=()
  if [[ "${route}" == "direct" ]]; then
    opts+=(--noproxy '*')
  fi
  if [[ -n "${CODE_RUNNER_API_KEY:-}" ]]; then
    code="$(curl "${opts[@]}" --silent --output /dev/null --write-out '%{http_code}' \
      --connect-timeout 2 --max-time 4 \
      -H "X-Auth-Token: ${CODE_RUNNER_API_KEY}" \
      "http://127.0.0.1:23580/languages" 2>/dev/null || true)"
    printf '%s runner Judge0 /languages: HTTP %s\n' "${route}" "${code:-unreachable}"
  fi
  if [[ "${mode}" == "terminal" ]]; then
    code="$(curl "${opts[@]}" --silent --output /dev/null --write-out '%{http_code}' \
      --connect-timeout 2 --max-time 4 \
      "http://127.0.0.1:23581/health" 2>/dev/null || true)"
    printf '%s runner Terminal /health: HTTP %s\n' "${route}" "${code:-unreachable}"
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

# A deliberately invalid token should fail authentication (401/403), rather
# than reaching language lookup; 500 here would implicate the auth middleware.
invalid_code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  --connect-timeout 2 --max-time 4 \
  -H 'X-Auth-Token: cppfan-invalid-diag-token' \
  "http://127.0.0.1:${judge_port}/languages" 2>/dev/null || true)"
printf 'Judge0 invalid-token /languages -> HTTP %s\n' "${invalid_code:-unreachable}"

if command -v docker >/dev/null 2>&1; then
  echo "Docker container names and health/status (no logs or environment values):"
  docker ps --format '{{.Names}}: {{.Status}}' 2>/dev/null || true

  echo "Judge0 container health metadata (no environment/command lines):"
  for container in judge0-v1131-server-1 judge0-v1131-db-1 judge0-v1131-redis-1 judge0-v1131-workers-1; do
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}not-configured{{end}}' "${container}" 2>/dev/null || true)"
    printf '%s: %s\n' "${container}" "${health:-not-found}"
  done

  echo "Judge0 DB readiness (exit status only):"
  if docker exec judge0-v1131-db-1 pg_isready -h 127.0.0.1 -q >/dev/null 2>&1; then
    echo "pg_isready: accepting connections"
  else
    echo "pg_isready: failed (check Postgres process and listen address)"
  fi

  echo "Recent Judge0 server error CLASS names only (never raw logs):"
  docker logs --since 10m judge0-v1131-server-1 2>&1 |
    grep -Eo 'PG::[A-Za-z_]+|ActiveRecord::[A-Za-z_]+|Redis::[A-Za-z_]+|Errno::[A-Za-z_]+|Rack::[A-Za-z_]+' |
    sort -u | head -n 12 || true
fi
echo "VPS root filesystem usage:"
df -h / | tail -n 1 || true
echo "VPS inode usage:"
df -i / | tail -n 1 || true
echo "Docker images/containers/volumes/build-cache summary:"
docker system df 2>/dev/null || true
echo "Host journal size:"
journalctl --disk-usage 2>/dev/null || true
echo "Large top-level directories (read-only):"
if sudo -n true 2>/dev/null; then
  sudo -n du -x -h -d 1 /var/log /var/lib /tmp /home 2>/dev/null | sort -h | tail -n 22 || true
  echo "Largest Docker JSON logs by size (bytes; no content):"
  sudo -n find /var/lib/docker/containers -type f -name '*-json.log' -printf '%s %p\n' 2>/dev/null |
    sort -nr | head -n 8 || true
else
  du -x -h -d 1 /var/log /tmp /home 2>/dev/null | sort -h | tail -n 18 || true
fi

for service in cppfan-gdb-debugger cppfan-terminal judge0; do
  status="$(systemctl is-active "${service}" 2>/dev/null || true)"
  printf 'systemd %s: %s\n' "${service}" "${status:-unknown}"
done
REMOTE
