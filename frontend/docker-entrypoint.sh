#!/bin/sh
set -eu

if [ -z "${API_BASE_URL:-}" ]; then
  # Default for local/dev; in Cloud Run you should set API_BASE_URL.
  API_BASE_URL="http://localhost:8080"
fi

PORT="${PORT:-8080}"

sed -e "s#__API_BASE_URL__#${API_BASE_URL}#g" \
    -e "s#__PORT__#${PORT}#g" \
    /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"

