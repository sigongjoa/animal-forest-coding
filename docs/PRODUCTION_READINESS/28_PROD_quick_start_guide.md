# Quick Start Fix Guide 🚀

**TL;DR**: 4 production issues + step-by-step fixes + verification commands

---

## Issue #1: Data Loss on Server Restart 🔴

**Problem**: `backend/src/routes/progression.ts:324` uses in-memory `Map` instead of database

**Fix (15 minutes)**:
```bash
# 1. Install database library
cd backend && npm install better-sqlite3

# 2. Create DatabaseService
# Copy: PRODUCTION_READINESS_FIX_PLAN.md → Issue #1 → Step 2
# File: backend/src/services/DatabaseService.ts

# 3. Update progression.ts (replace lines 324-359)
# Copy: PRODUCTION_READINESS_FIX_PLAN.md → Issue #1 → Step 3
# File: backend/src/routes/progression.ts

# 4. Update backend startup
# Copy: PRODUCTION_READINESS_FIX_PLAN.md → Issue #1 → Step 4
# File: backend/src/index.ts

# 5. Test persistence
npm run dev
# (in another terminal)
curl -X POST http://localhost:5000/api/progression/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"studentId":"test1","episodeId":"ep_1","completedMissions":[],"currentMissionIndex":0,"points":100,"badges":[],"lastModified":'$(date +%s000)'}'

# Stop server (Ctrl+C), restart, then:
curl http://localhost:5000/api/progression/load/test1 -H "Authorization: Bearer TOKEN"
# Should return saved data ✅
```

---

## Issue #2: Markdown Not Rendering 🟠

**Problem**: `frontend/src/pages/StoryPage.tsx:32` shows `**bold**` literally

**Fix (10 minutes)**:
```bash
# 1. Install markdown library
cd frontend && npm install react-markdown

# 2. Update StoryPage.tsx
# Find: p className="text-yellow-900 font-semibold..."
# Replace with code from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #2 → Step 3
# File: frontend/src/pages/StoryPage.tsx (around line 168)

# Test:
npm start
# Navigate to story page
# Should see: "이름하여... 파이썬(Python)이라네!" (not **파이썬**)
```

---

## Issue #3: Story Completion Not Saved 🟠

**Problem**: `frontend/src/pages/StoryPage.tsx:121` navigates without saving progress

**Fix (10 minutes)**:
```bash
# 1. Update StoryPage.tsx imports (top of file)
# Add: import { useDispatch, useSelector } from 'react-redux';
# Add: import { selectProgression } from '../store/slices/progressionSlice';
# Add: import { persistenceService } from '../services/PersistenceService';

# 2. Add inside component (after navigate = useNavigate())
# Add: const dispatch = useDispatch();
# Add: const progression = useSelector(selectProgression);

# 3. Add new function (replace handleNextDialogue)
# Copy entire function from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #3 → Step 3

# 4. Update handleSkip to call saveProgressionAndNavigate()

# Test:
npm start
# Complete story, should see in DevTools:
# Application → Local Storage → progression
# Should include: completedMissions: ["story"], points: 100+
```

---

## Issue #4: Story Data Hard-Coded 🟡

**Fix (20 minutes)**:
```bash
# 1. Create story data structure
mkdir -p backend/data/stories
# Create file: backend/data/stories/episode_1.json
# Copy content from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #4 → Step 1

# 2. Create StoryService
# File: backend/src/services/StoryService.ts
# Copy from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #4 → Step 2

# 3. Create stories API route
# File: backend/src/routes/stories.ts
# Copy from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #4 → Step 3

# 4. Register route in API
# File: backend/src/routes/api.ts
# Add: import storiesRouter from './stories';
# Add: app.use('/api/stories', storiesRouter);

# 5. Update frontend StoryPage
# File: frontend/src/pages/StoryPage.tsx
# Replace useState/useEffect sections with fetching logic
# Copy from: PRODUCTION_READINESS_FIX_PLAN.md → Issue #4 → Step 5

# Test:
npm run dev  # backend
npm start    # frontend (different terminal)
curl http://localhost:5000/api/stories/ep_1
# Should return episode data ✅
```

---

## Verification Checklist

- [ ] Issue #1: Server restart doesn't lose data
  - [ ] Save progression → Stop backend → Restart → Load progression ✅
  - [ ] Check `data/progression.db` file exists

- [ ] Issue #2: Markdown renders correctly
  - [ ] **bold text** appears bold
  - [ ] __italic text__ appears italic (if used)
  - [ ] No literal `**` characters visible

- [ ] Issue #3: Story completion saved
  - [ ] Complete story → Check localStorage for progress
  - [ ] Refresh page → Progress preserved
  - [ ] Backend synced (if logged in)

- [ ] Issue #4: Data-driven stories
  - [ ] API returns episode data: GET /api/stories/ep_1
  - [ ] Frontend fetches from API (not hard-coded)
  - [ ] Update JSON → Refresh frontend → Changes appear

---

## File Changes Summary

### Backend Files
```
✨ NEW: backend/src/services/DatabaseService.ts
✨ NEW: backend/src/services/StoryService.ts
✨ NEW: backend/src/routes/stories.ts
✨ NEW: backend/data/stories/episode_1.json
✨ NEW: backend/data/.gitignore

📝 UPDATED: backend/src/routes/progression.ts (lines 324-359)
📝 UPDATED: backend/src/index.ts (database init)
📝 UPDATED: backend/src/routes/api.ts (register stories)
📝 UPDATED: backend/package.json (add better-sqlite3)
```

### Frontend Files
```
📝 UPDATED: frontend/src/pages/StoryPage.tsx
  - Import PersistenceService
  - Fetch episode data from API
  - Use ReactMarkdown for dialogue
  - Save progress on completion

📝 UPDATED: frontend/package.json (add react-markdown)
```

### Config Files
```
📝 UPDATED: .gitignore (add data/*.db)
```

---

## Rollback Plan (If Issues Arise)

**For each fix, you can quickly revert:**

```bash
# Fix #1 (Database) - Revert to Map:
git checkout backend/src/services/DatabaseService.ts
git checkout backend/src/routes/progression.ts

# Fix #2 (Markdown) - Revert to plain text:
git checkout frontend/src/pages/StoryPage.tsx

# Fix #3 (Persistence) - Remove save logic:
git checkout frontend/src/pages/StoryPage.tsx

# Fix #4 (Data-driven) - Revert to hard-coded:
git checkout frontend/src/pages/StoryPage.tsx
git checkout backend/src/services/StoryService.ts
```

---

## Performance Impact

| Fix | Perf Impact | Notes |
|-----|------------|-------|
| #1 Database | ✅ No impact | SQLite faster than in-memory for persistence |
| #2 Markdown | ✅ Minimal | react-markdown highly optimized, tree-shakeable |
| #3 Persistence | ✅ No impact | Same operations, just on real data |
| #4 Data-driven | ✅ Improved | One API call at startup + cache = faster |

---

## Support

**If any fix fails:**

1. Check full guide: `PRODUCTION_READINESS_FIX_PLAN.md`
2. Verify dependencies installed: `npm list better-sqlite3` / `npm list react-markdown`
3. Check file paths and imports
4. Run tests: `npm test` / `npm run e2e`
5. Check backend logs: `DEBUG=* npm run dev`

---

## After All Fixes Complete

```bash
# Full test suite
npm test                    # Unit tests
npm run e2e                 # E2E tests

# Build for production
npm run build               # Both frontend and backend

# Final verification
npm run dev                 # Start both servers
# Navigate: http://localhost:3000
# Complete story → Check localStorage + backend
# Restart backend → Data persists ✅
```

✅ **Production Ready!**

---

🦝 Generated with Claude Code
