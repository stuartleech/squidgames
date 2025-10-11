#!/bin/bash

echo "🏈 SQUID GAMES 2025 - Tournament Setup"
echo "======================================"
echo ""
echo "This will start your local server with a public URL"
echo ""

# Kill any existing Next.js processes
echo "Stopping any running servers..."
pkill -f "next dev" 2>/dev/null || true

# Start the dev server in the background
echo "Starting local server..."
cd /Users/stuartleech/squidgames
npm run dev > /tmp/squidgames-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Start ngrok
echo ""
echo "🌐 Creating public URL with ngrok..."
echo ""
echo "================================"
echo "COPY THIS URL AND SHARE IT:"
echo "================================"
ngrok http 3000

# When ngrok is stopped, also stop the server
kill $SERVER_PID 2>/dev/null
echo ""
echo "Server stopped. Tournament data saved to tournament.db"

