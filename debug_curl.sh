#!/usr/bin/env bash
API=${REACT_APP_API_URL:-http://localhost:5001/api}
TOKEN="$1"

curl -i "$API/patron/my-borrowings?status=active" -H "Authorization: Bearer $TOKEN"
curl -i "$API/patron/recommendations" -H "Authorization: Bearer $TOKEN"
