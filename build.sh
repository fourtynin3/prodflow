#!/bin/bash
# build.sh — Render build script
# Injects GROQ_API_KEY environment variable into api.js

echo "Injecting Groq API Key..."

if [ -z "$GROQ_API_KEY" ]; then
  echo "ERROR: GROQ_API_KEY not set in Render Environment Variables!"
  exit 1
fi

sed -i "s|GROQ_KEY_PLACEHOLDER|$GROQ_API_KEY|g" js/api.js
echo "Done - API Key injected"
