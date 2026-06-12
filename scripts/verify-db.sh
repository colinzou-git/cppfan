#!/usr/bin/env bash
#
# Verify the live database after migrations (issue #21), using the PUBLIC anon
# key over the Supabase REST API — i.e. exactly what an untrusted browser client
# can see. Confirms the answer-key hardening (#15):
#   1. Display columns of learning_item_choices are readable.
#   2. is_correct is NOT readable by the anon role.
#   3. grade_learning_item_choice(...) grades a seeded item correctly.
#
# Read-only; safe to re-run. Signed-in flows (attempts/reviews/events) still need
# a manual browser check while logged in.
set -euo pipefail

# Auto-load .env.local if the public vars are not already exported, so this
# works from a Codespace without typing `set -a; . ./.env.local; set +a`.
if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

url="${NEXT_PUBLIC_SUPABASE_URL:-}"
key="${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}}"

if [ -z "${url}" ] || [ -z "${key}" ]; then
  cat >&2 <<'MSG'
Need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
(or NEXT_PUBLIC_SUPABASE_ANON_KEY) in the environment.

If they are in .env.local, load them first:
  set -a; . ./.env.local; set +a
then re-run: pnpm db:verify
MSG
  exit 1
fi

base="${url%/}/rest/v1"
auth=(-H "apikey: ${key}" -H "Authorization: Bearer ${key}")
item="cpp.structs_classes.syntax.mc_default_access"
correct_choice="cpp.structs_classes.syntax.mc_default_access.a"

echo "==> 1) Display columns of learning_item_choices are readable"
curl -fsS "${auth[@]}" "${base}/learning_item_choices?select=id,content,order_index&limit=1" >/dev/null
echo "    OK"

echo "==> 2) is_correct must NOT be readable by the anon role"
code="$(curl -s -o /dev/null -w '%{http_code}' "${auth[@]}" "${base}/learning_item_choices?select=is_correct&limit=1")"
if [ "${code}" = "200" ]; then
  echo "    FAIL: anon read is_correct (HTTP 200) — the column lockdown is not effective." >&2
  exit 1
fi
echo "    OK (read denied, HTTP ${code})"

echo "==> 3) grade_learning_item_choice RPC grades a seeded item"
resp="$(curl -fsS -X POST "${auth[@]}" -H "Content-Type: application/json" \
  -d "{\"p_item_id\":\"${item}\",\"p_choice_id\":\"${correct_choice}\"}" \
  "${base}/rpc/grade_learning_item_choice")"
echo "    response: ${resp}"
if printf '%s' "${resp}" | grep -q '"is_correct":true'; then
  echo "    OK (correct choice graded correct)"
else
  echo "    FAIL: unexpected RPC response." >&2
  exit 1
fi

echo
echo "==> Live answer-key hardening verified."
echo "    Still do one manual signed-in check: log in on the deployed app, answer"
echo "    a quiz item and rate a review, and confirm no errors and that the"
echo "    dashboard mastery/daily plan update (issue #21, item 5)."
