#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG=${1:-latest}
IMAGE_NAME=aivisa-web:${IMAGE_TAG}

ENV_FILE=${ENV_FILE:-.env.production.local}

if [ -f "$ENV_FILE" ]; then
  echo "Using env file: $ENV_FILE"
  docker run --rm -p 3000:3000 --env-file "$ENV_FILE" "$IMAGE_NAME"
else
  echo "Env file $ENV_FILE not found; running with current shell env"
  docker run --rm -p 3000:3000 "$IMAGE_NAME"
fi
