/**
 * Progression API Routes
 *
 * 역할:
 * 1. 학생의 게임 진행 상황을 저장
 * 2. 진행 상황을 복원
 * 3. 데이터 검증 (서버 사이드)
 * 4. 감시 로깅 (부정행위 감지)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// 타입 정의
interface GameState {
  studentId: string;
  episodeId: string;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  lastModified: number;
}

interface AuthRequest extends Request {
  user?: JwtPayload & { id: string; email: string };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 라우터
const router = Router();

// 미들웨어: 인증 확인
const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Login required',
    });
    return;
  }
  next();
};

// 미들웨어: 요청 데이터 검증
const validateProgressionData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const { completedMissions, points, badges, currentMissionIndex, episodeId } =
    req.body;

  // 필수 필드 확인
  if (
    !Array.isArray(completedMissions) ||
    typeof points !== 'number' ||
    !Array.isArray(badges) ||
    typeof currentMissionIndex !== 'number' ||
    !episodeId
  ) {
    res.status(400).json({
      success: false,
      error: 'Invalid progression data format',
    });
    return;
  }

  // 논리적 검증
  if (points < 0) {
    res.status(400).json({
      success: false,
      error: 'Points cannot be negative',
    });
    return;
  }

  if (currentMissionIndex < 0) {
    res.status(400).json({
      success: false,
      error: 'Mission index cannot be negative',
    });
    return;
  }

  next();
};

/**
 * POST /api/progression/save
 *
 * 클라이언트에서 보낸 게임 상태를 서버에 저장
 *
 * 요청:
 * ```
 * {
 *   "episodeId": "ep_1",
 *   "completedMissions": ["mission_1_1", "mission_1_2"],
 *   "currentMissionIndex": 2,
 *   "points": 1000,
 *   "badges": ["badge_1"]
 * }
 * ```
 */
router.post(
  '/save',
  authenticateUser,
  validateProgressionData,
  async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.user!.id;
      const { episodeId, completedMissions, currentMissionIndex, points, badges } =
        req.body;

      console.log(`💾 [Progression] Saving for student ${studentId}`);

      // Step 1: 서버 사이드 검증 (중요!)
      // 실제로 학생이 이 미션들을 풀었는지 확인해야 함
      // 지금은 간단한 구현, 나중에 코드 검증 로직과 연결
      const validationResult = validateMissionCompletion(
        completedMissions,
        points
      );

      if (!validationResult.valid) {
        console.warn(
          `⚠️ [Audit] Suspicious submission from ${studentId}: ${validationResult.reason}`
        );

        // 부정행위 기록
        await recordAuditLog(studentId, 'SUSPICIOUS_PROGRESSION', {
          reason: validationResult.reason,
          data: { completedMissions, points },
        });

        res.status(403).json({
          success: false,
          error: 'Invalid progression data detected',
          message: 'Progression validation failed',
        });
        return;
      }

      // Step 2: 데이터베이스에 저장
      // 실제 구현에서는 PostgreSQL에 저장
      const progressionData: GameState = {
        studentId,
        episodeId,
        completedMissions,
        currentMissionIndex,
        points,
        badges,
        lastModified: Date.now(),
      };

      // 임시: 메모리 저장 (나중에 DB로 교체)
      const savedData = await saveProgressionToDatabase(progressionData);

      // Step 3: 성공 응답
      res.json({
        success: true,
        message: 'Progression saved successfully',
        data: {
          savedAt: new Date().toISOString(),
          lastModified: progressionData.lastModified,
        },
      });

      console.log(`✅ [Progression] Saved successfully for ${studentId}`);
    } catch (error) {
      console.error('❌ [Progression] Save failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to save progression',
      });
    }
  }
);

/**
 * GET /api/progression/load
 *
 * 학생의 저장된 게임 상태를 복원
 *
 * 응답:
 * ```
 * {
 *   "success": true,
 *   "data": {
 *     "episodeId": "ep_1",
 *     "completedMissions": ["mission_1_1", "mission_1_2"],
 *     "currentMissionIndex": 2,
 *     "points": 1000,
 *     "badges": ["badge_1"],
 *     "lastModified": 1733350000000
 *   }
 * }
 * ```
 */
router.get('/load', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    console.log(`📂 [Progression] Loading for student ${studentId}`);

    // 데이터베이스에서 조회
    const progression = await loadProgressionFromDatabase(studentId);

    if (progression) {
      res.json({
        success: true,
        data: progression,
      });
      console.log(`✅ [Progression] Loaded for ${studentId}`);
    } else {
      res.json({
        success: true,
        data: null, // 첫 로그인
        message: 'No saved progression found (fresh start)',
      });
      console.log(`ℹ️ [Progression] No data found for ${studentId} (fresh start)`);
    }
  } catch (error) {
    console.error('❌ [Progression] Load failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to load progression',
    });
  }
});

/**
 * DELETE /api/progression/clear
 *
 * 진행 상황 초기화 (관리자용, 테스트용)
 */
router.delete('/clear', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    console.log(`🗑️ [Progression] Clearing for student ${studentId}`);

    // 데이터베이스에서 삭제
    await clearProgressionFromDatabase(studentId);

    res.json({
      success: true,
      message: 'Progression cleared',
    });

    console.log(`✅ [Progression] Cleared for ${studentId}`);
  } catch (error) {
    console.error('❌ [Progression] Clear failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ============================================================================
// Helper 함수들 (나중에 실제 DB와 연결)
// ============================================================================

/**
 * 진행 상황 검증
 *
 * 규칙:
 * 1. 미션별 포인트 검증
 * 2. 포인트 총합 확인
 * 3. 미션 순서 확인
 */
function validateMissionCompletion(
  completedMissions: string[],
  reportedPoints: number
): { valid: boolean; reason?: string } {
  // 미션별 포인트 (예시)
  const missionPoints: Record<string, number> = {
    mission_1_1: 500,
    mission_1_2: 500,
    mission_1_3: 600,
    // ... 더 많은 미션
  };

  // 포인트 계산
  let calculatedPoints = 0;
  for (const mission of completedMissions) {
    if (!(mission in missionPoints)) {
      // 알 수 없는 미션
      return {
        valid: false,
        reason: `Unknown mission: ${mission}`,
      };
    }
    calculatedPoints += missionPoints[mission];
  }

  // 보고된 포인트와 계산된 포인트 비교
  if (calculatedPoints !== reportedPoints) {
    return {
      valid: false,
      reason: `Points mismatch: reported ${reportedPoints}, calculated ${calculatedPoints}`,
    };
  }

  return { valid: true };
}

/**
 * 임시 저장소 (나중에 PostgreSQL로 교체)
 */
const progressionStore = new Map<string, GameState>();

async function saveProgressionToDatabase(state: GameState): Promise<GameState> {
  // TODO: Replace with actual database call
  // const result = await db.progression.upsert({
  //   where: { studentId: state.studentId },
  //   update: state,
  //   create: state,
  // });
  // return result;

  // 임시 구현
  progressionStore.set(state.studentId, state);
  return state;
}

async function loadProgressionFromDatabase(studentId: string): Promise<GameState | null> {
  // TODO: Replace with actual database call
  // const result = await db.progression.findUnique({
  //   where: { studentId },
  // });
  // return result || null;

  // 임시 구현
  return progressionStore.get(studentId) || null;
}

async function clearProgressionFromDatabase(studentId: string): Promise<void> {
  // TODO: Replace with actual database call
  // await db.progression.delete({
  //   where: { studentId },
  // });

  // 임시 구현
  progressionStore.delete(studentId);
}

/**
 * 감시 로깅 (부정행위 감지용)
 */
async function recordAuditLog(
  studentId: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  const log = {
    studentId,
    eventType,
    timestamp: new Date().toISOString(),
    details,
  };

  // TODO: 감시 로그를 별도 데이터베이스에 저장
  console.log('📊 [Audit]', JSON.stringify(log, null, 2));
}

export default router;
