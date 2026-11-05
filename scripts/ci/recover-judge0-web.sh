#!/usr/bin/env bash
# One-time, conditional restart of the Judge0 *web process only* after disk
# recovery. Does not touch database, Redis, volumes, workers, or credentials.
set -euo pipefail
: "$VPS_SSH_HOST"
: "$VPS_SSH_USER"
: "$CPPFAN_JUDGE0_SSH_KEY"
: "$CPPFAN_JUDGE0_KNOWN_HOSTS"
: "$CODE_RUNNER_API_KEY"
: "$CODE_RUNNER_BASE_URL"

status="$(curl --noproxy '*' --silent --output /dev/null --write-out '%{http_code}' \
  --connect-timeout 2 --max-time 4 \
  -H "X-Auth-Token: $CODE_RUNNER_API_KEY" \
  "$CODE_RUNNER_BASE_URL/languages" 2>/dev/null || true)"
if [[ "$status" != "500" ]]; then
  echo "Judge0 returned HTTP $status, not 500; skip conditional restart."
  exit 0
fi
echo "Authenticated Judge0 returns 500 after disk recovery; restarting web process only."

ssh -i "$CPPFAN_JUDGE0_SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$CPPFAN_JUDGE0_KNOWN_HOSTS" \
  -o PasswordAuthentication=no -o ConnectTimeout=8 \
  "$VPS_SSH_USER@$VPS_SSH_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
available="$(df -Pk / | awk 'NR==2 {print $4}')"
if (( available < 524288 )); then
  echo "Less than 512MiB free: refusing to restart Judge0." >&2
  exit 1
fi
docker inspect judge0-v1131-server-1 >/dev/null
docker restart judge0-v1131-server-1 >/dev/null
echo "Judge0 web container restart issued. Database, Redis and workers unchanged."
REMOTE

for _ in $(seq 1 30); do
  status="$(curl --noproxy '*' --silent --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 2 --max-time 4 \
    -H "X-Auth-Token: $CODE_RUNNER_API_KEY" \
    "$CODE_RUNNER_BASE_URL/languages" 2>/dev/null || true)"
  if [[ "$status" == "200" ]]; then
    echo "Authenticated Judge0 /languages recovered: HTTP 200."
    exit 0
  fi
  sleep 2
done
echo "Judge0 web restart did not restore authenticated /languages (HTTP $status)." >&2
exit 1
