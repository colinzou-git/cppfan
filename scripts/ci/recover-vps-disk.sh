#!/usr/bin/env bash
# Guarded VPS recovery: unused Docker cache/images and archived journals only.
# No Docker volumes, active containers, databases, or app files are removed.
set -euo pipefail
: "$VPS_SSH_HOST"
: "$VPS_SSH_USER"
: "$CPPFAN_JUDGE0_SSH_KEY"
: "$CPPFAN_JUDGE0_KNOWN_HOSTS"
ssh -i "$CPPFAN_JUDGE0_SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$CPPFAN_JUDGE0_KNOWN_HOSTS" \
  -o PasswordAuthentication=no -o ConnectTimeout=8 \
  "$VPS_SSH_USER@$VPS_SSH_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
available_kb() { df -Pk / | awk 'NR==2 {print $4}'; }
before="$(available_kb)"
echo "Disk before:"
df -h / | tail -n 1
docker system df
if (( before >= 2097152 )); then
  echo "2 GiB already free; no cleanup required."
  exit 0
fi
if sudo -n true 2>/dev/null; then
  sudo -n journalctl --vacuum-size=128M >/dev/null 2>&1 || true
fi
echo "Prune unused build cache older than seven days."
docker builder prune -a -f --filter 'until=168h' >/dev/null
echo "Prune dangling images; keep images used by any container."
docker image prune -f >/dev/null
if (( $(available_kb) < 2097152 )); then
  echo "Prune remaining unused images older than seven days."
  docker image prune -a -f --filter 'until=168h' >/dev/null
fi
echo "Disk after:"
df -h / | tail -n 1
docker system df
if (( $(available_kb) < 524288 )); then
  echo "Less than 512 MiB free after safe cleanup; additional investigation needed." >&2
  exit 1
fi
echo "Guarded disk recovery completed."
REMOTE
