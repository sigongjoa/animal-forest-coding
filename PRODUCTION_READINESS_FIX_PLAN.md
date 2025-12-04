# Production Readiness Fix Plan 🚀

**Date**: 2025-12-05
**Status**: Implementation Plan (Ready to Execute)
**Priority**: CRITICAL - All 4 issues block production deployment

---

## Executive Summary

This plan addresses 4 critical production issues identified in the CTO code review:

1. **Data Loss Risk** (Critical): In-memory database loses all student data on server restart
2. **UI Quality Issue** (High): Markdown syntax renders literally instead of formatted
3. **Missing Integration** (High): StoryPage doesn't save progress to persistence layer
4. **Architecture Limitation** (Medium): Hard-coded story data requires code recompilation for changes

**Estimated Implementation**: 4-6 hours (can be parallelized)
**Risk Level**: Low (isolated changes, no API contract changes)

---

## Issue #1: In-Memory Database Data Loss 🔴 CRITICAL

### Problem
```typescript
// backend/src/routes/progression.ts:324-338
const progressionStore = new Map<string, GameState>();

async function saveProgressionToDatabase(state: GameState): Promise<GameState> {
  progressionStore.set(state.studentId, state);  // ← Lost on server restart
  return state;
}
```

**Impact**:
- All student progression data lost on server crash/restart
- Affects every student using the system
- No data recovery possible
- Production blocker

### Solution: SQLite Implementation

**Why SQLite?**
- File-based, no external dependencies
- Perfect for MVP phase
- 0 setup overhead
- Upgradeable to PostgreSQL later

### Implementation Steps

#### Step 1: Install Dependencies
```bash
cd backend
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

#### Step 2: Create Database Service

**File**: `backend/src/services/DatabaseService.ts` (NEW)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

// GameState type (same as in progression.ts)
interface GameState {
  studentId: string;
  episodeId: string;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  lastModified: number;
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    // Create database in project root
    const dbPath = path.join(process.cwd(), 'data', 'progression.db');
    this.db = new Database(dbPath);

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Initialize schema
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Create progression table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS progression (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        episode_id TEXT NOT NULL,
        completed_missions TEXT NOT NULL DEFAULT '[]',
        current_mission_index INTEGER NOT NULL DEFAULT 0,
        points INTEGER NOT NULL DEFAULT 0,
        badges TEXT NOT NULL DEFAULT '[]',
        last_modified INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create audit log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database schema initialized');
  }

  // Save progression state
  async saveProgressionToDatabase(state: GameState): Promise<GameState> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO progression (
          student_id, episode_id, completed_missions,
          current_mission_index, points, badges, last_modified
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
          episode_id = ?, completed_missions = ?,
          current_mission_index = ?, points = ?, badges = ?,
          last_modified = ?, updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(
        state.studentId,
        state.episodeId,
        JSON.stringify(state.completedMissions),
        state.currentMissionIndex,
        state.points,
        JSON.stringify(state.badges),
        state.lastModified,
        // Update values
        state.episodeId,
        JSON.stringify(state.completedMissions),
        state.currentMissionIndex,
        state.points,
        JSON.stringify(state.badges),
        state.lastModified
      );

      console.log(`✅ Saved progression for ${state.studentId}`);
      return state;
    } catch (error) {
      console.error('❌ Failed to save progression:', error);
      throw error;
    }
  }

  // Load progression state
  async loadProgressionFromDatabase(studentId: string): Promise<GameState | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM progression WHERE student_id = ?
      `);

      const row = stmt.get(studentId) as any;

      if (!row) {
        console.log(`ℹ️ No progression found for ${studentId}`);
        return null;
      }

      const state: GameState = {
        studentId: row.student_id,
        episodeId: row.episode_id,
        completedMissions: JSON.parse(row.completed_missions),
        currentMissionIndex: row.current_mission_index,
        points: row.points,
        badges: JSON.parse(row.badges),
        lastModified: row.last_modified,
      };

      console.log(`✅ Loaded progression for ${studentId}`);
      return state;
    } catch (error) {
      console.error('❌ Failed to load progression:', error);
      throw error;
    }
  }

  // Clear progression
  async clearProgressionFromDatabase(studentId: string): Promise<void> {
    try {
      const stmt = this.db.prepare(`DELETE FROM progression WHERE student_id = ?`);
      stmt.run(studentId);
      console.log(`✅ Cleared progression for ${studentId}`);
    } catch (error) {
      console.error('❌ Failed to clear progression:', error);
      throw error;
    }
  }

  // Record audit log
  async recordAuditLog(
    studentId: string,
    eventType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO audit_logs (student_id, event_type, details)
        VALUES (?, ?, ?)
      `);

      stmt.run(studentId, eventType, JSON.stringify(details));
      console.log(`📊 [Audit] ${studentId}: ${eventType}`);
    } catch (error) {
      console.error('❌ Failed to record audit log:', error);
      throw error;
    }
  }

  // Health check
  health(): boolean {
    try {
      this.db.exec('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // Cleanup
  close(): void {
    this.db.close();
    console.log('✅ Database connection closed');
  }
}

export const databaseService = new DatabaseService();
```

#### Step 3: Update progression.ts to Use Database

**File**: `backend/src/routes/progression.ts`

Replace lines 324-359:

```typescript
// ✨ NEW: Database service import
import { databaseService } from '../services/DatabaseService';

// ✨ REMOVED: const progressionStore = new Map<string, GameState>();

// ✨ UPDATED: Use database instead of Map
async function saveProgressionToDatabase(state: GameState): Promise<GameState> {
  return await databaseService.saveProgressionToDatabase(state);
}

async function loadProgressionFromDatabase(studentId: string): Promise<GameState | null> {
  return await databaseService.loadProgressionFromDatabase(studentId);
}

async function clearProgressionFromDatabase(studentId: string): Promise<void> {
  return await databaseService.clearProgressionFromDatabase(studentId);
}

// ✨ UPDATED: Use database service for audit logs
async function recordAuditLog(
  studentId: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  await databaseService.recordAuditLog(studentId, eventType, details);
}
```

#### Step 4: Initialize Database on Server Start

**File**: `backend/src/index.ts`

Add before starting server:

```typescript
import { databaseService } from './services/DatabaseService';

// Initialize database on startup
const isDbHealthy = databaseService.health();
if (!isDbHealthy) {
  console.error('❌ Database health check failed');
  process.exit(1);
}

console.log('✅ Database service initialized');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  databaseService.close();
  process.exit(0);
});
```

#### Step 5: Update .gitignore

Add to `.gitignore`:
```
data/
data/*.db
data/*.db-shm
data/*.db-wal
```

### Verification

**Test data persistence:**

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Make a progression save request (in another terminal)
curl -X POST http://localhost:5000/api/progression/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "student-123",
    "episodeId": "ep_1",
    "completedMissions": ["mission-1"],
    "currentMissionIndex": 2,
    "points": 1000,
    "badges": ["first-completion"],
    "lastModified": 1701696000000
  }'

# 3. Stop backend (Ctrl+C)

# 4. Start backend again
npm run dev

# 5. Load the data - should still be there!
curl -X GET http://localhost:5000/api/progression/load/student-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Data is persisted ✅
```

**Benefits**:
- ✅ Data persists across server restarts
- ✅ Automatic schema creation
- ✅ Audit logging
- ✅ ACID compliance
- ✅ Zero external dependencies for MVP

---

## Issue #2: Markdown Rendering 🟠 HIGH

### Problem
```typescript
// frontend/src/pages/StoryPage.tsx:32
dialogues: [
  '이름하여... **파이썬(Python)**이라네!'  // ← Shows **파이썬** literally
]

// Current rendering:
// "이름하여... **파이썬(Python)**이라네!"
// Expected rendering:
// "이름하여... 파이썬(Python)이라네!" (with bold formatting)
```

### Solution: React-Markdown Library

#### Step 1: Install Dependency
```bash
cd frontend
npm install react-markdown
```

#### Step 2: Create Markdown Renderer Hook

**File**: `frontend/src/hooks/useMarkdownRenderer.ts` (NEW)

```typescript
import ReactMarkdown from 'react-markdown';

interface MarkdownRenderOptions {
  allowBold?: boolean;
  allowItalic?: boolean;
  allowCode?: boolean;
}

/**
 * Hook to render markdown text with styled components
 * Supports: **bold**, __italic__, `code`
 */
export const useMarkdownRenderer = () => {
  const renderMarkdown = (text: string, options: MarkdownRenderOptions = {}) => {
    const {
      allowBold = true,
      allowItalic = true,
      allowCode = false
    } = options;

    // Custom component mappings
    const components = {
      strong: ({ node, ...props }: any) => (
        <strong className="font-bold text-yellow-900" {...props} />
      ),
      em: ({ node, ...props }: any) => (
        <em className="italic text-yellow-800" {...props} />
      ),
      code: ({ node, ...props }: any) => (
        <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono text-sm" {...props} />
      ),
      p: ({ node, ...props }: any) => (
        <div {...props} />  // React-markdown wraps in <p>, we want inline
      )
    };

    return (
      <ReactMarkdown components={components}>
        {text}
      </ReactMarkdown>
    );
  };

  return { renderMarkdown };
};
```

#### Step 3: Update StoryPage to Use Markdown Renderer

**File**: `frontend/src/pages/StoryPage.tsx`

Replace lines 1-20 and update rendering section:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';  // ← NEW
import IDEWindowManager from '../components/IDEWindowManager';

// ... (rest of code stays same until rendering section)

// Update the dialogue rendering part (around line 168):
return (
  <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
    {/* ... other elements ... */}

    {/* Update this section: */}
    <div className="bg-white border-4 border-yellow-700 rounded-lg p-6 md:p-8 shadow-2xl min-h-32 md:min-h-40 flex flex-col justify-center">
      {/* 대사 텍스트 - with Markdown rendering */}
      <p className="text-yellow-900 font-semibold text-base md:text-lg leading-relaxed">
        <ReactMarkdown
          components={{
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-yellow-950" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-yellow-800" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono text-xs" {...props} />
            ),
            p: ({ node, ...props }) => <>{props.children}</>,  // Inline
          }}
        >
          {displayedText}
        </ReactMarkdown>
        {isTyping && <span className="animate-pulse">▋</span>}
      </p>
    </div>
  </div>
);
```

### Verification

**Test markdown rendering:**

```bash
# 1. Start frontend
cd frontend && npm start

# 2. Navigate to story page
# Should see:
# - "이름하여... 파이썬(Python)이라네!" ✅ (with bold formatting)
# - Instead of: "이름하여... **파이썬(Python)**이라네!" ❌

# 3. Test other markdown:
# - **bold text** → bold text ✅
# - __italic text__ → italic text ✅
# - `code snippet` → code snippet ✅
```

---

## Issue #3: Missing StoryPage ↔ PersistenceService Integration 🟠 HIGH

### Problem

```typescript
// frontend/src/pages/StoryPage.tsx:121
} else {
  // 스토리 완료 → IDE로 이동
  navigate('/ide');  // ← No progress saved!
}
```

**Impact**:
- Users who complete story don't have progress saved
- Must replay story on next session
- Defeats entire purpose of persistence layer

### Solution: Wire Story Completion to PersistenceService

#### Step 1: Import Required Services

**File**: `frontend/src/pages/StoryPage.tsx` (Add to imports at top)

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { selectProgression } from '../store/slices/progressionSlice';
import { persistenceService } from '../services/PersistenceService';
```

#### Step 2: Add State Management

**File**: `frontend/src/pages/StoryPage.tsx` (Inside component, after useState declarations)

```typescript
const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const progression = useSelector(selectProgression);  // ← NEW

  // ... existing state declarations ...
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(0);
  // ... rest stays same ...
};
```

#### Step 3: Update Story Completion Handler

**File**: `frontend/src/pages/StoryPage.tsx` (Replace handleNextDialogue function)

```typescript
// 다음 대사로
const handleNextDialogue = () => {
  const currentScene = scenes[currentSceneIndex];

  if (currentDialogueIndex < currentScene.dialogues.length - 1) {
    setCurrentDialogueIndex(currentDialogueIndex + 1);
    setDisplayedText('');
    setIsTyping(true);
  } else {
    // 다음 씬으로
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      // 스토리 완료 → 진행 상황 저장 후 IDE로 이동
      saveProgressionAndNavigate();
    }
  }
};

// ✨ NEW: Save progress before navigating
const saveProgressionAndNavigate = async () => {
  try {
    // Get current state
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId) {
      console.warn('⚠️ No userId found, navigating without saving');
      navigate('/ide');
      return;
    }

    // Create updated progression state
    const updatedProgression = {
      studentId: progression.studentId || userId,
      episodeId: progression.episodeId || 'ep_1',
      completedMissions: progression.completedMissions.includes('story')
        ? progression.completedMissions
        : [...progression.completedMissions, 'story'],
      currentMissionIndex: Math.max(progression.currentMissionIndex, 1),
      points: progression.points + 100, // Bonus for story completion
      badges: progression.badges.includes('story-complete')
        ? progression.badges
        : [...progression.badges, 'story-complete'],
      lastModified: Date.now(),
    };

    // Save to localStorage immediately
    persistenceService.saveToLocalStorage(updatedProgression);
    console.log('✅ Progress saved to localStorage');

    // Also sync to backend if logged in
    if (token) {
      try {
        await persistenceService.saveToBackend(updatedProgression, token);
        console.log('✅ Progress synced to backend');
      } catch (error) {
        console.warn('⚠️ Backend sync failed, but local save succeeded:', error);
      }
    }

    // Navigate to IDE
    navigate('/ide');
  } catch (error) {
    console.error('❌ Error saving progression:', error);
    // Still navigate even if save fails
    navigate('/ide');
  }
};

// ✨ NEW: Also update skip button to save progress
const handleSkip = () => {
  saveProgressionAndNavigate();
};
```

#### Step 4: Update PersistenceService (if needed)

**File**: `frontend/src/services/PersistenceService.ts`

Check that these methods exist (they should from Phase 1):

```typescript
// These methods should already exist:
saveToLocalStorage(state: any): void { ... }
loadFromLocalStorage(): any { ... }
saveToBackend(state: any, token: string): Promise<void> { ... }

// If missing, implement them following the same pattern as existing code
```

### Verification

**Test story progression save:**

```bash
# 1. Start frontend and backend
cd backend && npm run dev  # Terminal 1
cd frontend && npm start   # Terminal 2

# 2. Complete story:
# - Click through all dialogue
# - Click final "Next" button
# - Browser should navigate to /ide

# 3. Check localStorage:
# - Open DevTools (F12)
# - Application → Local Storage
# - Look for key: progression
# - Should show:
#   {
#     "completedMissions": ["story"],
#     "points": 100,
#     "badges": ["story-complete"],
#     "currentMissionIndex": 1,
#     ...
#   }

# 4. Verify backend sync:
# - Check backend console for "Progress synced to backend"
# - Query database:
curl http://localhost:5000/api/progression/load/student-123 \
  -H "Authorization: Bearer TOKEN"
# Should return the saved progression ✅

# 5. Test session persistence:
# - Refresh page (F5)
# - User should see their completed story + earned points
# - Progress persisted! ✅
```

---

## Issue #4: Hard-Coded Story Data 🟡 MEDIUM

### Problem

```typescript
// frontend/src/pages/StoryPage.tsx:23-51
const scenes: Scene[] = [
  {
    id: 1,
    image: '/assets/img1.jpg',
    dialogues: [
      // ... 5 hardcoded dialogues ...
    ],
    character: 'tom_nook',
    npcName: 'Tom Nook'
  },
  // ... more scenes ...
];
```

**Impact**:
- Story changes require code recompilation
- Content managers can't update story without developer
- Scalability issue for multi-episode system

### Solution: Data-Driven Architecture

#### Step 1: Create Story Data Structure

**File**: `backend/data/stories/episode_1.json` (NEW)

```json
{
  "id": "ep_1",
  "title": "파이썬과의 첫 만남",
  "description": "너굴이와 함께 프로그래밍을 배우는 첫 번째 에피소드",
  "order": 1,
  "scenes": [
    {
      "id": 1,
      "imageUrl": "/assets/stories/ep1/scene1.jpg",
      "character": "tom_nook",
      "characterName": "너굴",
      "dialogues": [
        "어서 오시게, 주민 대표!",
        "우리 섬 생활은 좀 익숙해졌나?",
        "다름이 아니라, 우리 섬도 이제 최첨단 디지털 시대를 맞이해서",
        "'무인도 이주 플랜 관리 시스템'을 도입했거든!",
        "이름하여... **파이썬(Python)**이라네!"
      ],
      "duration": 8000
    },
    {
      "id": 2,
      "imageUrl": "/assets/stories/ep1/scene2.jpg",
      "character": "tom_nook",
      "characterName": "너굴",
      "dialogues": [
        "자자, 겁먹을 것 없어!",
        "이건 그냥 아주 똑똑한 너굴포트라고 생각하면 돼.",
        "우리가 이 녀석한테 명령을 내리면,",
        "섬의 정보를 기억하거나 계산을 대신 해주지.",
        "오늘은 나랑 같이 이 시스템에 자네의 기본 정보를 등록해보자고.",
        "아주 쉬운 것부터 시작할 테니 걱정 말게!"
      ],
      "duration": 10000
    }
  ],
  "rewards": {
    "basePoints": 100,
    "completionBonus": 50,
    "skipPenalty": -20,
    "badges": ["story-complete"]
  }
}
```

#### Step 2: Create Story Service

**File**: `backend/src/services/StoryService.ts` (NEW)

```typescript
import fs from 'fs/promises';
import path from 'path';

interface Scene {
  id: number;
  imageUrl: string;
  character: string;
  characterName: string;
  dialogues: string[];
  duration: number;
}

interface StoryRewards {
  basePoints: number;
  completionBonus: number;
  skipPenalty: number;
  badges: string[];
}

interface Episode {
  id: string;
  title: string;
  description: string;
  order: number;
  scenes: Scene[];
  rewards: StoryRewards;
}

class StoryService {
  private storiesPath: string;
  private episodesCache: Map<string, Episode> = new Map();

  constructor() {
    this.storiesPath = path.join(process.cwd(), 'data', 'stories');
  }

  /**
   * Load episode by ID with caching
   */
  async getEpisode(episodeId: string): Promise<Episode | null> {
    try {
      // Check cache first
      if (this.episodesCache.has(episodeId)) {
        return this.episodesCache.get(episodeId) || null;
      }

      // Load from file
      const filePath = path.join(this.storiesPath, `${episodeId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const episode: Episode = JSON.parse(data);

      // Cache it
      this.episodesCache.set(episodeId, episode);

      console.log(`✅ Loaded episode: ${episodeId}`);
      return episode;
    } catch (error) {
      console.error(`❌ Failed to load episode ${episodeId}:`, error);
      return null;
    }
  }

  /**
   * Load all episodes
   */
  async getAllEpisodes(): Promise<Episode[]> {
    try {
      const files = await fs.readdir(this.storiesPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      const episodes: Episode[] = [];
      for (const file of jsonFiles) {
        const episodeId = file.replace('.json', '');
        const episode = await this.getEpisode(episodeId);
        if (episode) {
          episodes.push(episode);
        }
      }

      // Sort by order
      episodes.sort((a, b) => a.order - b.order);

      console.log(`✅ Loaded ${episodes.length} episodes`);
      return episodes;
    } catch (error) {
      console.error('❌ Failed to load episodes:', error);
      return [];
    }
  }

  /**
   * Validate scene completion
   */
  calculateRewards(episodeId: string, completed: boolean, skipped: boolean): number {
    // For now, just return base reward
    // Can be enhanced with different logic per episode
    const basePoints = 100;
    const completionBonus = completed ? 50 : 0;
    const skipPenalty = skipped ? -20 : 0;

    return basePoints + completionBonus + skipPenalty;
  }

  /**
   * Invalidate cache (for hot reload in development)
   */
  invalidateCache(): void {
    this.episodesCache.clear();
    console.log('✅ Story cache invalidated');
  }
}

export const storyService = new StoryService();
```

#### Step 3: Create Story API Endpoint

**File**: `backend/src/routes/stories.ts` (NEW)

```typescript
import { Router, Request, Response } from 'express';
import { storyService } from '../services/StoryService';

const router = Router();

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * GET /api/stories/:episodeId
 * Get single episode by ID
 */
router.get('/:episodeId', async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;

    const episode = await storyService.getEpisode(episodeId);

    if (!episode) {
      res.status(404).json({
        success: false,
        message: 'Episode not found',
        error: `Episode ${episodeId} does not exist`
      } as ApiResponse<null>);
      return;
    }

    res.json({
      success: true,
      message: 'Episode loaded successfully',
      data: episode
    } as ApiResponse<any>);
  } catch (error) {
    console.error('❌ Error loading episode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load episode',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/stories
 * Get all episodes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const episodes = await storyService.getAllEpisodes();

    res.json({
      success: true,
      message: 'Episodes loaded successfully',
      data: episodes
    } as ApiResponse<any[]>);
  } catch (error) {
    console.error('❌ Error loading episodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load episodes',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

export default router;
```

#### Step 4: Register Route in API

**File**: `backend/src/routes/api.ts`

Add to existing API routes:

```typescript
import storiesRouter from './stories';

// ... existing routes ...

// Register stories API
app.use('/api/stories', storiesRouter);
```

#### Step 5: Update Frontend to Fetch Story Data

**File**: `frontend/src/pages/StoryPage.tsx`

Replace hard-coded scenes with fetched data:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import IDEWindowManager from '../components/IDEWindowManager';

interface Scene {
  id: number;
  imageUrl: string;
  character: string;
  characterName: string;
  dialogues: string[];
  duration: number;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  rewards: any;
}

const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { episodeId = 'ep_1' } = useParams();

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const typingIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✨ NEW: Fetch story data from backend
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${episodeId}`);
        if (!response.ok) throw new Error('Failed to load story');

        const data = await response.json();
        setEpisode(data.data);
        console.log('✅ Story loaded:', data.data);
      } catch (error) {
        console.error('❌ Error loading story:', error);
        // Fallback to default story if API fails
        setEpisode(getDefaultEpisode());
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [episodeId]);

  // Fallback default episode
  const getDefaultEpisode = (): Episode => ({
    id: 'ep_1',
    title: '파이썬과의 첫 만남',
    description: '너굴이와 함께 프로그래밍을 배우는 첫 번째 에피소드',
    scenes: [
      {
        id: 1,
        imageUrl: '/assets/img1.jpg',
        character: 'tom_nook',
        characterName: '너굴',
        dialogues: [
          '어서 오시게, 주민 대표!',
          '우리 섬 생활은 좀 익숙해졌나?',
        ],
        duration: 8000
      }
    ],
    rewards: {
      basePoints: 100,
      completionBonus: 50,
      badges: ['story-complete']
    }
  });

  // ... rest of component stays mostly the same, just use episode?.scenes instead of scenes ...

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">스토리 로딩 중...</p>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">스토리를 불러올 수 없습니다</p>
      </div>
    );
  }

  const currentScene = episode.scenes[currentSceneIndex];
  const currentDialogue = currentScene.dialogues[currentDialogueIndex];

  // ... rest stays same, using episode.scenes instead of scenes const ...
};
```

### Verification

**Test data-driven stories:**

```bash
# 1. Create story file
mkdir -p backend/data/stories
# Create episode_1.json as shown above

# 2. Start backend
cd backend && npm run dev

# 3. Test story API
curl http://localhost:5000/api/stories/ep_1

# Should return: episode with scenes, dialogues, rewards ✅

# 4. Start frontend
cd frontend && npm start

# 5. Navigate to story
# Should fetch from API instead of hard-coded
# Content matches episode_1.json ✅

# 6. Update JSON and refresh frontend
# Changes appear without code recompilation ✅

# 7. Test episode list
curl http://localhost:5000/api/stories

# Should return all episodes ✅
```

---

## Implementation Timeline & Checklist

### Priority 1: Data Persistence (Critical) - 1-2 hours
- [ ] Create `backend/src/services/DatabaseService.ts`
- [ ] Install `better-sqlite3`
- [ ] Update `backend/src/routes/progression.ts` to use database
- [ ] Update `backend/src/index.ts` for database initialization
- [ ] Test data persistence across server restarts

### Priority 2: StoryPage Integration (High) - 30 minutes
- [ ] Add PersistenceService imports to StoryPage
- [ ] Implement `saveProgressionAndNavigate()` function
- [ ] Update `handleNextDialogue()` to save before navigate
- [ ] Update `handleSkip()` to save before navigate
- [ ] Test story completion saves progress

### Priority 3: Markdown Rendering (High) - 30 minutes
- [ ] Install `react-markdown` in frontend
- [ ] Update StoryPage dialogue rendering with ReactMarkdown
- [ ] Test markdown formatting: **bold**, __italic__
- [ ] Verify visual appearance matches design

### Priority 4: Data-Driven Stories (Medium) - 1.5-2 hours
- [ ] Create `backend/data/stories/episode_1.json`
- [ ] Create `backend/src/services/StoryService.ts`
- [ ] Create `backend/src/routes/stories.ts`
- [ ] Register stories API in main routes
- [ ] Update StoryPage to fetch from API
- [ ] Add fallback to default story if API fails
- [ ] Test content loading without recompilation

---

## Risk Assessment

| Issue | Risk | Mitigation |
|-------|------|-----------|
| Database migration | Low | SQLite requires no setup, data automatically created |
| Breaking API changes | Low | New endpoints only, existing ones unchanged |
| Markdown rendering | Low | Uses popular library, fallback to plain text |
| Story API failure | Low | Frontend has fallback to default story |
| Performance | Low | Story cache + lazy loading + CDN ready |

---

## Success Criteria

After implementing all 4 fixes:

✅ **Data Persistence**: Server restart preserves student data
✅ **UI Quality**: Markdown text renders with proper formatting
✅ **Integration**: Story completion triggers progress save
✅ **Scalability**: Content updates without code recompilation
✅ **Production Ready**: MVP ready for deployment

---

## 🚀 Next Steps

1. **Implement Priority 1-2 immediately** (Critical blockers)
2. **Test each fix** with provided verification commands
3. **Deploy to staging** for validation
4. **Implement Priority 3-4** for production quality
5. **Run full test suite** before production deployment

---

🦝 **Generated with Claude Code**

Co-Authored-By: Claude <noreply@anthropic.com>
