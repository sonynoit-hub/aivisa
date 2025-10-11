#!/usr/bin/env bash
set -e

echo "📦 Preparing standalone server..."

# Ensure static files are copied
if [ ! -d ".next/standalone/.next/static" ]; then
  echo "→ Copying .next/static to standalone..."
  cp -r .next/static .next/standalone/.next/static
fi

if [ ! -d ".next/standalone/public" ]; then
  echo "→ Copying public to standalone..."
  cp -r public .next/standalone/public
fi

echo "✅ Ready to start"
echo ""

# Start the server
cd .next/standalone
PORT="${PORT:-3000}" node server.js
