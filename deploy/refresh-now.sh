#!/usr/bin/env bash
set -euo pipefail

read_env_value() {
  key="$1"
  file="$2"
  awk -v key="$key" '
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    index($0, key "=") == 1 {
      sub("^[^=]*=", "")
      gsub(/\r$/, "")
      if (($0 ~ /^".*"$/) || ($0 ~ /^\047.*\047$/)) {
        print substr($0, 2, length($0) - 2)
      } else {
        print
      }
      exit
    }
  ' "$file"
}

env_file=".env"

if [ ! -f "$env_file" ]; then
  echo ".env is missing."
  exit 1
fi

ADMIN_TOKEN="$(read_env_value ADMIN_TOKEN "$env_file")"
PORT="$(read_env_value PORT "$env_file")"

if [ -z "${ADMIN_TOKEN:-}" ]; then
  echo "ADMIN_TOKEN is missing in .env."
  exit 1
fi

curl -fsS -X POST \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  http://127.0.0.1:${PORT:-3000}/api/update
echo
