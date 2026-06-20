#!/usr/bin/env bash
set -euo pipefail
base64 -d supabase/migrations/20260619235900_ai_chat.sql.b64 > supabase/migrations/20260619235900_ai_chat.sql
