# Phase 3: Next Session Implementation Guide

**Created**: 2025-12-05
**Status**: 🚀 Ready for Next Session
**Priority**: HIGH - Implement next items immediately

---

## 🎯 What's Done

Before starting your next session, understand that **50% of Phase 3 is complete**:

### ✅ Completed (Do NOT redo)
1. **12-Mission Curriculum** - All data files created, fully validated
2. **Mission Backend Services** - MissionService, API routes working
3. **AI Feedback System** - FeedbackContextService ready for integration
4. **Gamification System** - GamificationService with 14 badges ready
5. **Backend Build** - Compiles with zero errors
6. **All Tests Passing** - 64/64 advanced tests still pass

### 📂 Key Files to Know
```
backend/
├── data/missions/mission-001-012.json (12 curriculum files)
├── src/models/Mission.ts (data model)
├── src/services/
│   ├── MissionService.ts (mission management)
│   ├── FeedbackContextService.ts (AI context)
│   ├── GamificationService.ts (points & badges)
│   └── (existing: NookAIService, StoryService, etc.)
└── src/routes/
    └── missions.ts (API endpoints)
```

---

## 🚀 Quick Start for Next Session

### Step 1: Verify Everything Still Works
```bash
# Check backend compiles
cd backend && npm run build

# Run tests to confirm nothing broke
cd .. && npm test -- tests/advanced

# Both should succeed
```

### Step 2: Understand the Architecture
Read these files in order:
1. `docs/PHASE_DOCUMENTATION/22_PHASE_3_comprehensive_implementation_guide.md` (overview)
2. `docs/PHASE_DOCUMENTATION/23_PHASE_3_status_report.md` (detailed status)
3. `PHASE_3_SESSION_SUMMARY.md` (what was delivered)

### Step 3: Review the Data Structure
Look at one mission file to understand the structure:
```bash
# Example: See what a mission looks like
cat backend/data/missions/mission-001-variables.json
```

---

## 📋 Next Session TODO (In Priority Order)

### Phase 3.2: Frontend Integration (40% of Phase 3)

#### Task 1: Create Story Sequences for 12 Missions
**Estimated Time**: 3-4 hours
**Dependencies**: None (ready to start immediately)
**Files to Create**:
- Create image directory structure for mission scenes:
  ```
  frontend/public/episode/1/mission-001/ → mission-012/
  └── scene-1.png, scene-2.png, scene-3.png
  ```
- Update StoryService to load mission stories alongside episodes

**What to Do**:
1. For each of 12 missions, create 3-4 scene images (or use placeholders)
2. Update mission JSON files to include proper `storyContext.sceneImages` paths
3. Create MissionScene model to represent story progression
4. Integrate with StoryService for loading

**Test After**:
- Call `/api/missions/mission-001` and verify all images load
- Create a StoryService test for mission story loading

---

#### Task 2: Build MissionPage React Component
**Estimated Time**: 3-4 hours
**Dependencies**: Task 1 (story sequences)
**Files to Create**:
- `frontend/src/pages/MissionPage.tsx` (main component)
- `frontend/src/components/MissionStoryDisplay.tsx` (story scenes)
- `frontend/src/components/MissionIDEEditor.tsx` (code editor)
- `frontend/src/hooks/useMissionProgress.ts` (state management)

**Component Structure**:
```
MissionPage
├── MissionStoryDisplay (shows scenes, dialogue)
├── MissionIDEEditor (code editor with validation)
│   ├── CodeEditor (editor with syntax highlighting)
│   ├── ValidateButton (run validation)
│   └── HintButton (show hints)
└── MissionFeedback (AI feedback display)
```

**Key Features**:
- Load mission data from `/api/missions/:missionId`
- Display story scenes in sequence
- Embedded IDE with template code
- Step-by-step progression (unlock next step on success)
- Real-time validation feedback
- Call NookAIService for personalized feedback

**Test After**:
- Can load any mission and display story
- IDE validates code correctly
- Steps unlock progressively
- Feedback displays properly

---

#### Task 3: Create ProgressDashboard Component
**Estimated Time**: 2-3 hours
**Dependencies**: Task 2 (mission completion tracking)
**Files to Create**:
- `frontend/src/pages/ProgressPage.tsx` (main dashboard)
- `frontend/src/components/ProgressBar.tsx` (visual progress)
- `frontend/src/components/BadgeShowcase.tsx` (badges display)
- `frontend/src/components/StatsCard.tsx` (reusable stats card)

**Dashboard Sections**:
1. **Overall Progress**
   - Progress bar: 0-12 missions
   - Points earned vs. maximum
   - Current level (Novice/Apprentice/Expert/Master)

2. **Difficulty Breakdown**
   - Beginner missions: 0-6
   - Intermediate missions: 0-4
   - Advanced missions: 0-2

3. **Badge Showcase**
   - Display earned badges with icons
   - Show locked badges greyed out
   - Show progress toward badge unlock

4. **Statistics**
   - Total points earned
   - Average attempts per mission
   - Perfect attempts count
   - Current streak

5. **Leaderboard Preview**
   - Top 5 students
   - Current user's rank
   - Points vs. top student

**Test After**:
- Dashboard loads student progress correctly
- Badges display accurately
- Progress bars update on mission completion
- Leaderboard shows correct rankings

---

#### Task 4: Create Leaderboard API Endpoint
**Estimated Time**: 1-2 hours
**Dependencies**: GamificationService (already implemented)
**Files to Modify**:
- `backend/src/routes/missions.ts` - Add leaderboard route

**Endpoint**:
```
GET /api/missions/leaderboard?limit=50&offset=0
Response:
{
  success: true,
  data: [
    {
      rank: 1,
      studentId: "...",
      studentName: "...",
      points: 5000,
      badges: 8,
      missionsCompleted: 12
    },
    ...
  ],
  total: 245
}
```

**Test After**:
- Endpoint returns leaderboard correctly sorted
- Pagination works (`limit` and `offset`)
- User's rank displayed correctly

---

### Phase 3.3: Integration Layer (10% of Phase 3)

#### Task 5: Connect Gamification to Progression
**Estimated Time**: 1-2 hours
**Dependencies**: GamificationService (ready), MissionPage (Task 2)
**Files to Modify**:
- `backend/src/routes/progression.ts`

**Changes**:
1. When mission is completed, call `gamificationService.calculateRewards()`
2. Update student points in database
3. Check for badge unlocks
4. Return points earned + new badges in response

**Example**:
```typescript
// In progression save endpoint
const rewards = gamificationService.calculateRewards(
  mission,
  timeSpentSeconds,
  isFirstAttempt,
  hintsUsed
);

// Update database
const newProgress = await updateStudentProgress(studentId, {
  points: progression.totalPoints + rewards.totalPoints,
  completedMissions: [...completedMissions, missionId]
});

// Check badges
const newBadges = await checkBadgeUnlocks(studentId, newProgress);

response.json({
  success: true,
  pointsEarned: rewards.totalPoints,
  newBadges: newBadges,
  newLevel: getStudentLevel(newProgress.totalPoints)
});
```

---

#### Task 6: Integrate AI Feedback Context
**Estimated Time**: 1-2 hours
**Dependencies**: FeedbackContextService (ready), existing feedback routes
**Files to Modify**:
- `backend/src/routes/feedback.ts` or create new `/api/feedback/detailed`

**Changes**:
1. When generating feedback, gather student context
2. Call `feedbackContextService.generateFeedbackGuidance()`
3. Pass guidance to NookAIService for personalized response
4. Return enhanced feedback with tone adjustment

**Example**:
```typescript
const studentContext = {
  completedMissions: progression.completedMissions,
  totalPointsEarned: progression.totalPoints,
  averageAttemptsPerMission: 2.1,
  commonErrorPatterns: analyzeErrors(studentId)
};

const feedbackGuidance = feedbackContextService.generateFeedbackGuidance({
  studentContext,
  mission,
  currentStep: 1,
  previousAttempts: 2,
  timeSinceLastAttempt: 5,
  hintsUsed: []
});

const aiResponse = await nookAIService.generateFeedback(
  submission,
  feedbackGuidance
);
```

---

### Phase 3.4: Production Hardening (Remaining 10%)

#### Task 7: Performance & Security Audit
**Estimated Time**: 2-3 hours
**No dependencies** - Can run in parallel

**Checklist**:
- [ ] Run load test on mission endpoints (use autocannon)
- [ ] Check database query performance
- [ ] Verify cache hit rates (MissionService LRU)
- [ ] Test API response times (<200ms target)
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Add input validation to all routes
- [ ] Test error handling (400, 404, 500 responses)

**Run These**:
```bash
# Check security
npm audit

# Load test (install autocannon first)
npm install -g autocannon
autocannon http://localhost:5000/api/missions -c 10 -d 30

# Check TypeScript strict mode
cd backend && npx tsc --strict
```

---

## 🔗 Integration Checklist

Before deploying, verify these integrations work:

- [ ] `GET /api/missions/mission-001` returns mission with story images
- [ ] `POST /api/progression/save` calls gamification service
- [ ] Gamification returns points earned and badge unlocks
- [ ] MissionPage component loads mission and validates code
- [ ] AI feedback uses FeedbackContextService for personalization
- [ ] ProgressDashboard shows correct student stats
- [ ] Leaderboard ranks students correctly
- [ ] All tests still pass (64/64)
- [ ] Backend builds without errors
- [ ] No security vulnerabilities (npm audit)

---

## 📊 Key APIs to Implement in Frontend

### 1. Load Mission
```javascript
const mission = await apiClient.get(`/missions/${missionId}`);
```

### 2. Submit Code & Get Feedback
```javascript
const feedback = await apiClient.post('/feedback', {
  code: userCode,
  missionId,
  stepId,
  language: 'python'
});
```

### 3. Save Progress & Get Rewards
```javascript
const result = await apiClient.post('/progression/save', {
  completedMissions,
  totalPoints,
  lastMissionId
});
// Returns: { pointsEarned, newBadges, newLevel }
```

### 4. Load Leaderboard
```javascript
const leaderboard = await apiClient.get('/missions/leaderboard?limit=50');
```

### 5. Load Student Progress
```javascript
const progress = await apiClient.get('/progression/load');
// Returns: { totalPoints, badges, missionsCompleted, level }
```

---

## 🧪 Testing Strategy for Next Session

### Before Starting
```bash
npm test -- tests/advanced  # Should pass 64/64
cd backend && npm run build  # Should succeed
```

### After Each Task
1. **Task 1**: Test `GET /api/missions/:missionId` returns story images
2. **Task 2**: Test MissionPage loads and validates code
3. **Task 3**: Test ProgressDashboard displays correct data
4. **Task 4**: Test `/api/missions/leaderboard` endpoint
5. **Task 5**: Test progression save calls gamification
6. **Task 6**: Test feedback uses personalization context

### End of Session
```bash
# Full regression test
npm test                     # All tests
npm run build               # Both backend and frontend
```

---

## 🎓 Code Examples

### Load Mission in React
```typescript
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Mission } from '../types/Mission';

export function MissionPage({ missionId }: { missionId: string }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/missions/${missionId}`).then(mission => {
      setMission(mission);
      setLoading(false);
    });
  }, [missionId]);

  if (loading) return <div>Loading...</div>;
  if (!mission) return <div>Mission not found</div>;

  return (
    <div>
      <h1>{mission.title}</h1>
      <p>{mission.description}</p>
      {mission.steps.map(step => (
        <div key={step.id}>
          <h2>{step.title}</h2>
          <p>{step.prompt}</p>
          <CodeEditor template={step.template} />
        </div>
      ))}
    </div>
  );
}
```

### Call Gamification Service
```typescript
import { gamificationService } from './GamificationService';

const mission = await missionService.getMission(missionId);
const rewards = gamificationService.calculateRewards(
  mission,
  timeSpent,
  isFirstAttempt,
  hintsUsedCount
);

console.log(`Earned ${rewards.totalPoints} points!`);
// Output: "Earned 500 points!"
```

---

## 📞 Reference Materials

**In This Repo**:
- `docs/PHASE_DOCUMENTATION/22_PHASE_3_comprehensive_implementation_guide.md` - Full Phase 3 plan
- `docs/PHASE_DOCUMENTATION/23_PHASE_3_status_report.md` - Detailed status
- `PHASE_3_SESSION_SUMMARY.md` - What was delivered
- `backend/src/models/Mission.ts` - Data structure
- `backend/src/services/MissionService.ts` - How to use missions
- `backend/src/services/GamificationService.ts` - How to use gamification

**Backend Endpoints Ready to Call**:
- `GET /api/missions` - All missions
- `GET /api/missions/:missionId` - Specific mission
- `GET /api/missions/difficulty/beginner` - Filter by level
- `GET /api/missions/:missionId/prerequisites` - Prerequisites
- `POST /api/missions/check-access` - Validate access

---

## ✅ Success Criteria for Next Session

By end of next session, you should have:

- ✅ All 12 missions with story sequences displayable
- ✅ MissionPage component that loads missions and validates code
- ✅ ProgressDashboard showing student progress
- ✅ Leaderboard API and frontend display
- ✅ Gamification integrated into progression saving
- ✅ AI feedback using context-aware personalization
- ✅ All tests still passing
- ✅ Zero security vulnerabilities
- ✅ API response times <200ms

This will bring Phase 3 to **~90% completion**, with only final polish and CI/CD pipeline remaining.

---

**Status**: 🚀 **Ready for Implementation**
**Difficulty**: Medium (standard React + Express work)
**Estimated Time**: 10-12 hours
**Readiness Level**: 100% (all dependencies complete)

---

**Good luck! The backend is ready and waiting for frontend integration.** 🎉

Last Updated: 2025-12-05
