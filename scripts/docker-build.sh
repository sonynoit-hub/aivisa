#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG=${1:-latest}
IMAGE_NAME=aivisa-web:${IMAGE_TAG}

# Load .env.production.local if present to provide build-time public envs
if [ -f .env.production.local ]; then
  export $(grep -E '^(NEXT_PUBLIC_[A-Z0-9_]+|APP_ENV)=' .env.production.local | xargs)
fi

: "${APP_ENV:=deploy}"

echo "Building ${IMAGE_NAME} with NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE:-<unset>} APP_ENV=${APP_ENV}"

docker build \
  --build-arg NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-}" \
  --build-arg APP_ENV="${APP_ENV}" \
  -t ${IMAGE_NAME} .

echo "Built ${IMAGE_NAME}"
