#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/ecr-push.sh <aws-region> <aws-account-id> <repository-name> [tag]
# Example: ./scripts/ecr-push.sh ap-northeast-1 123456789012 aivisa-web v1

REGION=${1:-ap-northeast-1}
ACCOUNT=${2:?AWS account id required}
REPO=${3:-aivisa-web}
TAG=${4:-latest}

IMAGE_URI=${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}

# Login to ECR
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com

# Ensure repo exists (no-op if exists)
aws ecr describe-repositories --repository-names ${REPO} --region ${REGION} >/dev/null 2>&1 || \
  aws ecr create-repository --repository-names ${REPO} --region ${REGION} >/dev/null

# Build & push
docker build -t ${REPO}:${TAG} .
docker tag ${REPO}:${TAG} ${IMAGE_URI}
docker push ${IMAGE_URI}

echo "Pushed: ${IMAGE_URI}"
