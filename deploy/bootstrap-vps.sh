#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker first, then rerun this script."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available. Install the Docker Compose plugin first."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  admin_token="$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_' | tr -d '=' || true)"
  raw_token="$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_' | tr -d '=' || true)"

  if [ -n "$admin_token" ]; then
    sed -i "s|^ADMIN_TOKEN=.*|ADMIN_TOKEN=$admin_token|" .env
  fi
  if [ -n "$raw_token" ]; then
    sed -i "s|^RAW_DOWNLOAD_TOKEN=.*|RAW_DOWNLOAD_TOKEN=$raw_token|" .env
  fi

  chmod 600 .env
  echo "Created .env. Edit PUBLIC_BASE_URL and PROVIDER_SUBSCRIPTION_URL before the first real update."
fi

mkdir -p data/backups data/profiles
docker compose up -d --build
docker compose ps
