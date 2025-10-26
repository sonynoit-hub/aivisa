#!/usr/bin/env bash
set -euo pipefail

# Ensure we're at repo root
cd "$(dirname "$0")/.."

# Guard: advise to stop dev server to avoid rsync reading changing files
if lsof -iTCP -sTCP:LISTEN -nP 2>/dev/null | grep -q "node.*:3000"; then
  echo "[error] Detected a dev server listening on port 3000."
  echo "        Please stop 'next dev' before packaging to avoid truncated file errors."
  exit 1
fi

# Timestamped artifact name under deploy
TS=$(date +%Y%m%d-%H%M%S)
ART_DIR="deploy"
ART_NAME="aivisa-standalone-${TS}.zip"

# Clean deploy staging (but keep node_modules if any)
rm -rf "${ART_DIR}/.next" "${ART_DIR}/public"
mkdir -p "${ART_DIR}/.next" "${ART_DIR}/public"

# Stage standalone runtime and static assets
# Sync standalone runtime (don't use --delete here to preserve existing artifacts like previous zips)
rsync -a .next/standalone/ "${ART_DIR}/"
# Copy static assets (retry a couple of times if transient fs errors occur)
ATTEMPTS=0
until rsync -a --delete .next/static/ "${ART_DIR}/.next/static/"; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ "$ATTEMPTS" -ge 3 ]; then
    echo "[error] Failed to copy .next/static after ${ATTEMPTS} attempts."
    exit 1
  fi
  echo "[warn] rsync of .next/static failed (attempt ${ATTEMPTS}), retrying in 1s..."
  sleep 1
done
cp .next/BUILD_ID "${ART_DIR}/.next/BUILD_ID"
rsync -a --delete public/ "${ART_DIR}/public/"

# Create zip excluding node_modules and macOS noise
(
  cd "${ART_DIR}"
  zip -r "${ART_NAME}" . \
    -x "node_modules/*" \
    -x "*.zip" \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -q
)

# Move artifact to deploy root with readable name
echo "Packaged: ${ART_DIR}/${ART_NAME}"
ls -lh "${ART_DIR}/${ART_NAME}" | sed -e "s/^/  /"
