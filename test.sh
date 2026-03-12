#!/bin/bash
URL="https://cloudflare-search.phu.workers.dev"

if [ -z "$API_KEY" ]; then
  echo "Warning: API_KEY not set. Export it first: export API_KEY=your-key"
  exit 1
fi

echo "=== Test 1: Find People ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"prompt": "people", "query": "Dvuln company"}' | python3 -m json.tool

echo ""
echo "=== Test 2: Find Repos ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"prompt": "repos", "query": "Dvuln company"}' | python3 -m json.tool

echo ""
echo "=== Test 3: Find APIs ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"prompt": "apis", "query": "Dvuln company"}' | python3 -m json.tool

echo ""
echo "=== Test 4: Raw Query ==="
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"query": "What services does Dvuln company offer?"}' | python3 -m json.tool

