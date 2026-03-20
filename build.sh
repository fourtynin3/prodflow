#!/bin/bash
echo "Injecting API Keys..."

if [ -z "$GROQ_API_KEY" ]; then
  echo "ERROR: GROQ_API_KEY not set!"; exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
  echo "ERROR: GOOGLE_CLIENT_ID not set!"; exit 1
fi

sed -i "s|GROQ_KEY_PLACEHOLDER|$GROQ_API_KEY|g" js/api.js
sed -i "s|GOOGLE_CLIENT_ID_PLACEHOLDER|$GOOGLE_CLIENT_ID|g" js/auth.js

echo "Done!"
