# ⚠️ CRITICAL: DATABASE PERSISTENCE ISSUE

## The Problem
The Netlify deployment uses an **in-memory database** that:
- Resets on every API request
- Loses all score/game data
- Cannot persist changes

## Solution for Tournament Day (Oct 11, 2025)

### Option 1: Run Locally (RECOMMENDED for tournament)
```bash
npm run dev
```

Then:
1. Make your computer accessible on the local network
2. Find your local IP: `ifconfig | grep inet` (Mac/Linux) or `ipconfig` (Windows)
3. Share the URL with others: `http://YOUR_IP:3000`
4. Everyone on the same WiFi can access it

### Option 2: Use ngrok to expose local server
```bash
# Install ngrok
brew install ngrok  # Mac
# or download from https://ngrok.com

# Run your local server
npm run dev

# In another terminal, expose it
ngrok http 3000
```
This gives you a public URL that works anywhere!

### Option 3: Deploy to a Platform with Persistent Database
You need to migrate to one of these:
- **Vercel** with Vercel Postgres
- **Railway** with PostgreSQL
- **Supabase** (free tier available)
- **PlanetScale** (free tier available)

## What Won't Work
- ❌ Deploying to Netlify as-is (data will reset)
- ❌ Expecting scores to persist on the current Netlify setup

## For Future: Proper Database Migration Required
The codebase needs to be updated to use a cloud database service instead of in-memory storage.

