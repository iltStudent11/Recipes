#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

request_status() {
  local method="$1"
  local url="$2"
  local body="${3:-}"

  if [[ -n "$body" ]]; then
    curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body"
  else
    curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url"
  fi
}

echo "Running smoke test against $BASE_URL"

health_status="$(request_status GET "$BASE_URL/health")"
if [[ "$health_status" != "200" ]]; then
  echo "Health check failed: expected 200, got $health_status"
  exit 1
fi
echo "✓ Health check (200)"

list_status="$(request_status GET "$BASE_URL/recipes")"
if [[ "$list_status" != "200" ]]; then
  echo "List recipes failed: expected 200, got $list_status"
  exit 1
fi
echo "✓ List recipes (200)"

create_payload='{"name":"Smoke Test Brownie","category":"brownie","ingredients":["cocoa","flour","butter","sugar","eggs"],"instructions":"Mix, pour, and bake."}'
create_raw="$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/recipes" -H "Content-Type: application/json" -d "$create_payload")"
create_response="$(printf '%s' "$create_raw" | sed '$d')"
create_status="$(printf '%s' "$create_raw" | tail -n 1)"
if [[ "$create_status" != "201" ]]; then
  echo "Create recipe failed: expected 201, got $create_status"
  exit 1
fi

auto_id="$(printf '%s' "$create_response" | node -e "let input='';process.stdin.on('data',d=>input+=d);process.stdin.on('end',()=>{const parsed=JSON.parse(input);if(!parsed.id){process.exit(1);}process.stdout.write(String(parsed.id));});")"
if [[ -z "$auto_id" ]]; then
  echo "Create recipe failed: no id returned"
  exit 1
fi
echo "✓ Create recipe (201), id=$auto_id"

read_status="$(request_status GET "$BASE_URL/recipes/$auto_id")"
if [[ "$read_status" != "200" ]]; then
  echo "Read recipe failed: expected 200, got $read_status"
  exit 1
fi
echo "✓ Read recipe (200)"

update_payload='{"name":"Smoke Test Fudgy Brownie","category":"brownie","ingredients":["cocoa","flour","butter","sugar","eggs"],"instructions":"Mix, pour, and bake until set."}'
update_status="$(request_status PUT "$BASE_URL/recipes/$auto_id" "$update_payload")"
if [[ "$update_status" != "200" ]]; then
  echo "Update recipe failed: expected 200, got $update_status"
  exit 1
fi
echo "✓ Update recipe (200)"

delete_status="$(request_status DELETE "$BASE_URL/recipes/$auto_id")"
if [[ "$delete_status" != "204" ]]; then
  echo "Delete recipe failed: expected 204, got $delete_status"
  exit 1
fi
echo "✓ Delete recipe (204)"

confirm_status="$(request_status GET "$BASE_URL/recipes/$auto_id")"
if [[ "$confirm_status" != "404" ]]; then
  echo "Delete confirmation failed: expected 404, got $confirm_status"
  exit 1
fi
echo "✓ Confirm delete (404)"

echo "Smoke test passed."
