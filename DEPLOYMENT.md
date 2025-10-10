# 🚀 Deployment Guide - Netlify Blobs Setup

## What Changed?
We've migrated from an in-memory database to **Netlify Blobs** for persistent storage!

## How to Deploy to Netlify

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Implement Netlify Blobs for persistent storage"
git push origin main
```

### Step 2: Netlify Will Auto-Deploy
Netlify will automatically:
- Detect the changes
- Build your Next.js app
- Set up Netlify Blobs automatically (no manual config needed!)

### Step 3: Initialize the Database
After the first deployment, you need to populate the database with initial data.

**Visit this URL once:**
```
https://YOUR_NETLIFY_SITE.netlify.app/api/init-data
```

This will create:
- ✅ 4 Teams (Margate Krakens, Exiles Black, Exiles Silver, Solent Red Storm)
- ✅ 6 Games with correct times and referees
- ✅ Tournament rules

### Step 4: Test It!
1. Go to your admin panel: `https://YOUR_NETLIFY_SITE.netlify.app/admin`
2. Log in with password: `_Squid-Games-2025!_`
3. Update a score and set status to "completed"
4. Check the standings - they should persist!
5. Refresh the page - scores should still be there!

## Important Notes

### ✅ Data Now Persists!
- Scores will persist between deployments
- Standings will update correctly
- No more data loss on refresh

### 🔄 Re-initializing Data
If you need to reset all data back to default:
1. Visit `/api/init-data` again
2. This will wipe existing data and recreate from scratch

### 🎯 For the Tournament (Oct 11, 2025)
Everything should now work on Netlify! You can:
- Update scores in real-time
- Standings will calculate automatically
- All data persists properly
- Multiple admins can use it simultaneously

## Troubleshooting

### If scores still don't persist:
1. Check Netlify build logs for errors
2. Ensure Netlify Blobs is enabled for your site
3. Make sure you visited `/api/init-data` after deployment

### If you see "No games scheduled":
- You need to visit `/api/init-data` to initialize the database

## Local Development
Your local environment will continue using SQLite (`tournament.db`), which works great!

```bash
npm run dev
```

Local data is separate from Netlify Blobs data.

