#!/usr/bin/env bash
#
# Codespace bootstrap for cppFan. Keeps pnpm in lockstep with CI (pnpm@10.0.0,
# Node 22) and installs the Supabase CLI so migrations can be pushed from a
# real terminal — useful when working from an iPhone via a browser Codespace.
set -euo pipefail

# Use the repo token when present so GitHub API calls avoid the 60/hr
# unauthenticated rate limit.
gh_api() {
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    curl -fsSL -H "Authorization: Bearer ${GITHUB_TOKEN}" "$@"
  else
    curl -fsSL "$@"
  fi
}

echo "==> Enabling pnpm 10.0.0 via Corepack"
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm --version

echo "==> Installing Supabase CLI"
install_supabase() {
  local arch tag url tmp
  arch="$(dpkg --print-architecture)" # amd64 | arm64
  tag="$(gh_api https://api.github.com/repos/supabase/cli/releases/latest \
    | grep -oP '"tag_name":\s*"\K[^"]+')"
  url="$(gh_api "https://api.github.com/repos/supabase/cli/releases/tags/${tag}" \
    | grep -oP '"browser_download_url":\s*"\K[^"]+' \
    | grep "linux_${arch}.tar.gz$" | head -n1)"
  if [ -z "${url}" ]; then
    echo "WARN: no Supabase CLI linux_${arch} asset found for ${tag}; skipping." >&2
    return 1
  fi
  tmp="$(mktemp -d)"
  curl -fsSL "${url}" -o "${tmp}/supabase.tar.gz"
  tar -xzf "${tmp}/supabase.tar.gz" -C "${tmp}"
  sudo install -m 0755 "${tmp}/supabase" /usr/local/bin/supabase
  rm -rf "${tmp}"
  supabase --version
}
# Never fail the whole container build if the CLI download has a hiccup; the
# Supabase SQL Editor in the browser remains a working fallback for migrations.
install_supabase || echo "WARN: Supabase CLI install failed; use the Supabase SQL Editor in the browser instead." >&2

echo "==> Installing project dependencies"
pnpm install --frozen-lockfile

echo "==> Ready. Start the app with 'pnpm dev' (port 3000 is auto-forwarded)."
