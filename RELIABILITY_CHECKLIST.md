# 🔒 Tournament Day Reliability Checklist

## ✅ What We've Fixed

### **1. Persistent Database**
- ✅ Migrated from in-memory to Netlify Blobs
- ✅ Data persists between deployments
- ✅ Scores won't disappear on refresh
- ✅ Multiple admins can update simultaneously

### **2. Standings Calculation**
- ✅ Team stats update BEFORE game record
- ✅ Only updates when status = "completed"
- ✅ Handles score corrections properly
- ✅ Prevents double-counting wins/losses
- ✅ Added debug logging for troubleshooting

### **3. Data Freshness**
- ✅ No-cache headers on API endpoints
- ✅ 2-second polling for real-time updates
- ✅ Tab state persists (no reset to Schedule)

### **4. Error Handling**
- ✅ Proper async/await for all database operations
- ✅ Try-catch blocks on all API routes
- ✅ Graceful fallbacks for missing data

## 🧪 Testing Steps (After Deployment)

### **Test 1: Score Persistence**
1. Go to admin panel
2. Select a game
3. Add scores: Home: 14, Away: 7
4. Status: "completed"
5. Click "Update Game"
6. **Hard refresh page** (Cmd+Shift+R / Ctrl+Shift+R)
7. ✅ Scores should still be there

### **Test 2: Standings Update**
1. After completing Test 1
2. Go to "Standings" tab
3. ✅ Winning team should have: 1W, 0L, +7 Diff, 2 PTS
4. ✅ Losing team should have: 0W, 1L, -7 Diff, 0 PTS
5. ✅ Points For/Against should be correct

### **Test 3: Score Correction**
1. Go back to admin
2. Edit the same game: Home: 21, Away: 14
3. Keep status: "completed"
4. Update and refresh
5. ✅ New scores should show
6. ✅ Standings should reflect the difference (+7 → +7 still, but PF/PA changed)

### **Test 4: Multiple Games**
1. Complete 2-3 different games
2. Check standings after each
3. ✅ All records should accumulate correctly
4. ✅ Points differential should be accurate

## 🚨 Troubleshooting Guide

### **If Scores Don't Persist:**
1. Check Netlify function logs for errors
2. Verify Netlify Blobs is enabled
3. Try clearing browser cache
4. Check browser console for API errors

### **If Standings Don't Update:**
1. Check Netlify function logs (look for `[Standings Update]` messages)
2. Verify game status is exactly "completed"
3. Ensure both scores are numbers (not null/empty)
4. Check browser console for errors

### **To View Logs:**
1. Go to Netlify dashboard
2. Click on your site
3. Go to "Functions" → "squidgames-db"
4. View real-time logs

## 📊 Monitoring During Tournament

### **Before Tournament Starts:**
- [ ] Test all 4 scenarios above
- [ ] Verify admin password works
- [ ] Check all 6 games are listed
- [ ] Confirm team names and colors are correct
- [ ] Test on both desktop and mobile

### **During Tournament:**
- [ ] Keep Netlify function logs open in a tab
- [ ] After each game completion, verify standings update
- [ ] If issue occurs, check logs immediately
- [ ] Have backup: local server ready (npm run dev)

### **Quick Recovery Steps (If Needed):**
1. **If data looks wrong:**
   - Don't panic!
   - Check logs first
   - Can manually fix via admin panel

2. **If site is down:**
   - Switch to local server (npm run dev)
   - Use ngrok for public access
   - Copy current scores from Netlify before switching

## 🎯 Tournament Day Best Practices

### **Admin Panel Usage:**
1. **Only change status to "completed" when game is FINISHED**
2. **Enter final scores before marking complete**
3. **Double-check scores before saving**
4. **One admin updates at a time** (to avoid conflicts)
5. **Wait 2-3 seconds between updates** (for data sync)

### **Score Entry Order:**
1. Enter Home Score
2. Enter Away Score
3. Select Status: "Completed"
4. Click "Update Game"
5. Wait for "Game updated successfully!" message
6. Check standings to verify

### **If You Need to Fix a Score:**
1. Go back to the same game
2. Enter new scores
3. Keep status as "Completed"
4. Update - it will recalculate automatically

## 🔧 Emergency Contacts

- **Netlify Dashboard**: https://app.netlify.com
- **GitHub Repo**: https://github.com/stuartleech/squidgames
- **Site URL**: https://squidgames.margatekrakens.co.uk
- **Admin Panel**: https://squidgames.margatekrakens.co.uk/admin

## 📝 Notes
- Local database (tournament.db) is separate from Netlify
- Changes pushed to GitHub auto-deploy to Netlify
- Netlify Blobs data persists across all deployments
- Mobile-friendly - works on phones/tablets

