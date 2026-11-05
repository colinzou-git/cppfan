#!/usr/bin/env bash
# One-time recovery: start the existing stopped Judge0 PostgreSQL container.
# No database migration, data deletion, container recreation, or volume pruning.
set -euo pipefail
: "$VPS_SSH_HOST"
: "$VPS_SSH_USER"
: "$CPPFAN_JUDGE0_SSH_KEY"
: "$CPPFAN_JUDGE0_KNOWN_HOSTS"
: "$CODE_RUNNER_API_KEY"
: "$CODE_RUNNER_BASE_URL"

ssh -i "$CPPFAN_JUDGE0_SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$CPPFAN_JUDGE0_KNOWN_HOSTS" \
  -o PasswordAuthentication=no -o ConnectTimeout=8 \
  "$VPS_SSH_USER@$VPS_SSH_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
db=judge0-v1131-db-1
running="$(docker inspect --format '{{.State.Running}}' "$db")"
oom="$(docker inspect --format '{{.State.OOMKilled}}' "$db")"
exit_code="$(docker inspect --format '{{.State.ExitCode}}' "$db")"
mem_kb="$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)"
disk_kb="$(df -Pk / | awk 'NR==2 {print $4}')"
printf 'Postgres before: running=%s OOMKilled=%s exit=%s memory_available_KiB=%s disk_available_KiB=%s\n' \
  "$running" "$oom" "$exit_code" "$mem_kb" "$disk_kb"
if (( disk_kb < 524288 || mem_kb < 262144 )); then
  echo "Insufficient free disk or memory: refusing to start database." >&2
  exit 1
fi
if [[ "$running" != "true" ]]; then
  echo "Starting the existing Postgres container (preserving its volume)."
  docker start "$db" >/dev/null
fi
ready=false
for _ in $(seq 1 35); do
  if docker exec "$db" pg_isready -q >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != "true" ]]; then
  echo "PostgreSQL did not report ready after start." >&2
  exit 1
fi
echo "PostgreSQL readiness verified. Existing data volume preserved."
REMOTE

check_languages() {
  curl --noproxy '*' --silent --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 2 --max-time 4 \
    -H "X-Auth-Token: $CODE_RUNNER_API_KEY" \
    "$CODE_RUNNER_BASE_URL/languages" 2>/dev/null || true
}
for _ in $(seq 1 12); do
  status="$(check_languages)"
  if [[ "$status" == "200" ]]; then
    echo "Authenticated Judge0 /languages returned 200 after DB recovery."
    exit 0
  fi
  sleep 2
done

echo "DB ready but Judge0 web API still HTTP $status; restart web process once."
ssh -i "$CPPFAN_JUDGE0_SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$CPPFAN_JUDGE0_KNOWN_HOSTS" \
  -o PasswordAuthentication=no -o ConnectTimeout=8 \
  "$VPS_SSH_USER@$VPS_SSH_HOST" 'docker restart judge0-v1131-server-1 >/dev/null'
for _ in $(seq 1 25); do
  status="$(check_languages)"
  if [[ "$status" == "200" ]]; then
    echo "Authenticated Judge0 /languages returned 200 after database and web recovery."
    exit 0
  fi
  sleep 2
done
echo "Judge0 remains unhealthy (HTTP $status); stop automatic recovery and investigate." >&2
exit 1
