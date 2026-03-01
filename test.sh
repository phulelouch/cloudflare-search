#!/bin/bash
URL="https://cloudflare-search.phu.workers.dev"

echo "=== Test 1: Find People ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "people", "query": "Dvuln"}' | python3 -m json.tool

echo ""
echo "=== Test 2: Find Repos ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "repos", "query": "Dvuln"}' | python3 -m json.tool

echo ""
echo "=== Test 3: Find APIs ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "apis", "query": "Dvuln"}' | python3 -m json.tool

echo ""
echo "=== Test 4: Raw Query ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "What services does Dvuln offer?"}' | python3 -m json.tool
