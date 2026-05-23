#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

detect_ip() {
  local ip
  ip="$(ipconfig getifaddr en0 2>/dev/null || true)"
  if [[ -z "$ip" ]]; then
    ip="$(ifconfig en0 | awk '/inet / {print $2; exit}')"
  fi
  if [[ -z "$ip" ]]; then
    ip="$(ifconfig | awk '/inet / && $2 !~ /^127\\./ {print $2; exit}')"
  fi
  echo "$ip"
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"

  touch "$file"

  if grep -q "^${key}=" "$file"; then
    perl -0pi -e "s#^${key}=.*#${key}=${value}#m" "$file"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$file"
  fi
}

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
  fi
}

LAN_IP="$(detect_ip)"
if [[ -z "$LAN_IP" ]]; then
  echo "Could not detect a local Wi-Fi IP address."
  exit 1
fi

FRONTEND_URL="http://${LAN_IP}:3000"
BACKEND_URL="http://${LAN_IP}:8000"
API_URL="${BACKEND_URL}/api"
CORS_ORIGINS="${FRONTEND_URL},http://localhost:3000,http://127.0.0.1:3000"
SANCTUM_DOMAINS="${LAN_IP}:3000,localhost:3000,127.0.0.1:3000"

set_env_value "$ROOT_DIR/.env.local" "NEXT_PUBLIC_API_BASE_URL" "$API_URL"

set_env_value "$BACKEND_DIR/.env" "APP_URL" "$BACKEND_URL"
set_env_value "$BACKEND_DIR/.env" "FRONTEND_URL" "$FRONTEND_URL"
set_env_value "$BACKEND_DIR/.env" "CORS_ALLOWED_ORIGINS" "$CORS_ORIGINS"
set_env_value "$BACKEND_DIR/.env" "SANCTUM_STATEFUL_DOMAINS" "$SANCTUM_DOMAINS"
set_env_value "$BACKEND_DIR/.env" "CACHE_STORE" "file"
set_env_value "$BACKEND_DIR/.env" "SESSION_DRIVER" "file"

stop_port 3000
stop_port 8000
sleep 1

echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  ${BACKEND_URL}"
echo "API:      ${API_URL}"

cd "$BACKEND_DIR"
php artisan config:clear >/dev/null
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!

cd "$ROOT_DIR"
NEXT_PUBLIC_API_BASE_URL="$API_URL" npm run frontend:mobile &
FRONTEND_PID=$!

cleanup() {
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

wait
