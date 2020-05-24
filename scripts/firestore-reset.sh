#!/bin/bash

set -e

FIRESTORE_BASE_URL=http://localhost:8080/v1/
FIRESTORE_URL=${FIRESTORE_BASE_URL}projects/telegramdefi/databases/\(default\)/documents/

docs=$(curl -sS -H "Accept: application/json" -H "Content-Type: application/json" -X GET ${FIRESTORE_URL})

if [[ ${#docs} == 3 ]]; then
  echo "no documents to delete"
else
  docs=$(jq '.documents[].name' <<< "${docs}")

  c=0
  for doc in ${docs}
  do
    curl -X DELETE "${FIRESTORE_BASE_URL}${doc:1:-1}" > /dev/null
    ((c=c + 1))
  done
  echo "${c} documents deleted"
fi
