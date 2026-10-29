#!/usr/bin/env bash
# Build the frontend on this machine and sync dist/ to the prod box, so the
# 1.9GB box never needs node_modules or a build. Nothing on the box restarts:
# nginx serves the files straight from REMOTE_DIR.
#
#   ./deploy_frontend.sh              test + build + deploy
#   SKIP_TESTS=1 ./deploy_frontend.sh build + deploy only
#   ./deploy_frontend.sh --rollback   restore the previous deploy
#
# Override any default below via environment variables.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

KEY_PATH="${KEY_PATH:-$HOME/Downloads/af_connect.pem}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_HOST="${SERVER_HOST:-ec2-13-238-42-132.ap-southeast-2.compute.amazonaws.com}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/AF_Connect_frontend/dist}"
SITE_HOST="${SITE_HOST:-reports.anytimefitnesscorporate.com}"
# Same origin as the site, so the session cookie is shared with /admin/. Set explicitly
# so a local .env (e.g. localhost:8000) can never leak into a prod build.
VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://${SITE_HOST}/api}"

REMOTE="${SERVER_USER}@${SERVER_HOST}"
PREV_DIR="${REMOTE_DIR}.prev"
SSH=(ssh -i "$KEY_PATH")

if [ ! -f "$KEY_PATH" ]; then
  echo "Error: SSH key not found at $KEY_PATH" >&2
  exit 1
fi

if [ "${1:-}" = "--rollback" ]; then
  echo "==> Rolling back ${REMOTE_DIR} from ${PREV_DIR}..."
  "${SSH[@]}" "$REMOTE" "test -d '${PREV_DIR}'" || { echo "Error: no previous deploy at ${PREV_DIR}" >&2; exit 1; }
  "${SSH[@]}" "$REMOTE" "rsync -a --delay-updates --delete-after '${PREV_DIR}/' '${REMOTE_DIR}/'"
  echo "==> Rolled back."
  exit 0
fi

[ -d node_modules ] || { echo "==> Installing dependencies (npm ci)..."; npm ci; }

if [ -z "${SKIP_TESTS:-}" ]; then
  echo "==> Running tests (npm test)..."
  npm test
fi

echo "==> Building frontend (API: ${VITE_API_BASE_URL})..."
rm -rf dist
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build

if [ ! -f dist/index.html ]; then
  echo "Error: build did not produce dist/index.html" >&2
  exit 1
fi

echo "==> Saving the current deploy as ${PREV_DIR} (for --rollback)..."
"${SSH[@]}" "$REMOTE" "rsync -a --delete '${REMOTE_DIR}/' '${PREV_DIR}/'"

# --delay-updates puts every new file in place with a rename at the end, and
# --delete-after removes stale hashed assets only once the new ones are there,
# so visitors never hit a half-synced site.
echo "==> Syncing dist/ -> ${REMOTE}:${REMOTE_DIR}..."
rsync -az --delay-updates --delete-after -e "ssh -i ${KEY_PATH}" dist/ "${REMOTE}:${REMOTE_DIR}/"

# Ask nginx on the box (127.0.0.1 is allowed even though the origin is Cloudflare-only)
# which bundle it serves, and compare with what we just built.
echo "==> Verifying what nginx serves..."
built="$(grep -o 'assets/index-[^"]*\.js' dist/index.html | head -1)"
served="$("${SSH[@]}" "$REMOTE" "curl -sk --resolve ${SITE_HOST}:443:127.0.0.1 https://${SITE_HOST}/ | grep -o 'assets/index-[^\"]*\.js' | head -1")"
if [ -z "$built" ] || [ "$built" != "$served" ]; then
  echo "Error: nginx serves '${served:-nothing}', expected '${built}'. Roll back with: $0 --rollback" >&2
  exit 1
fi

echo "==> Done. Live at https://${SITE_HOST}/ (${built})"
