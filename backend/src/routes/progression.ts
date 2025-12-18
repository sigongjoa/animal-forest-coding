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
import { databaseService } from '../services/DatabaseService';

// 타입 정의
interface GameState {
  studentId: string;
  episodeId: string;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  lastModified: number;
  perfectMissionCount: number;
  speedRunCount: number;
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
// 미들웨어: 인증 확인
const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    // 개발용 더미 토큰 허용
    if (token && (token.startsWith('dummy-token') || token.startsWith('demo-token'))) {
      req.user = { id: 'test_user', email: 'test@example.com' };
      next();
      return;
    }
  }

  // 인증 실패
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
      const { episodeId, completedMissions, currentMissionIndex, points, badges, perfectMissionCount, speedRunCount } =
        req.body;

      console.log(`💾 [Progression] Saving for student ${studentId}`);

      // Step 1: 서버 사이드 검증 (중요!)
      // 실제로 학생이 이 미션들을 풀었는지 확인해야 함
      // 지금은 간단한 구현, 나중에 코드 검증 로직과 연결
      const validationResult = await validateMissionCompletion(
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
        perfectMissionCount: perfectMissionCount || 0,
        speedRunCount: speedRunCount || 0,
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
/**
 * 진행 상황 검증
 *
 * 규칙:
 * 1. 미션별 포인트 검증
 * 2. 포인트 총합 확인
 * 3. 미션 순서 확인
 */
async function validateMissionCompletion(
  completedMissions: string[],
  reportedPoints: number
): Promise<{ valid: boolean; reason?: string }> {
  // 1. 미션 목록이 유효한지 확인
  if (!Array.isArray(completedMissions)) {
    return { valid: false, reason: 'Invalid completedMissions format' };
  }

  // 2. 보고된 총 포인트가 "가능한 최대 포인트" 이내인지 확인
  // (정확한 계산은 완료 시점의 보너스 등 변수가 많아, 최대치 기준으로 이상 여부 판별)
  // 예: 지금까지 깬 미션들의 (기본 점수 + 최대 보너스) 합보다 reportedPoints가 월등히 높으면 의심

  let maxPossiblePoints = 0;

  // Note: This logic assumes missionService.getMission is available.
  // Since we are in the same process, we can use the imported MissionService instance.
  // We need to make sure `missionService` is imported at the top of the file.

  for (const missionId of completedMissions) {
    const mission = await import('../services/MissionService').then(m => m.missionService.getMission(missionId));
    if (mission) {
      // Base + Speed + Perfect
      maxPossiblePoints += (mission.rewards.basePoints + mission.rewards.speedBonus + mission.rewards.perfectBonus);
    }
  }

  // Allow a small buffer or identical check. 
  // If reported points is significantly higher than maxPossiblePoints (e.g. hack), reject.
  if (reportedPoints > maxPossiblePoints + 100) { // +100 buffer just in case of events or adjustments
    return {
      valid: false,
      reason: `Reported points (${reportedPoints}) exceed calculated max possible (${maxPossiblePoints})`
    };
  }

  return { valid: true };
}

/**
 * DatabaseService에서 데이터 저장소 관리
 * SQLite 기반 영속성 저장소 사용
 */
async function saveProgressionToDatabase(state: GameState): Promise<GameState> {
  return await databaseService.saveProgressionToDatabase(state);
}

async function loadProgressionFromDatabase(studentId: string): Promise<GameState | null> {
  return await databaseService.loadProgressionFromDatabase(studentId);
}

async function clearProgressionFromDatabase(studentId: string): Promise<void> {
  return await databaseService.clearProgressionFromDatabase(studentId);
}

/**
 * 감시 로깅 (부정행위 감지용)
 */
async function recordAuditLog(
  studentId: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  // SQLite DB에 감시 로그 저장
  try {
    await databaseService.recordAuditLog(studentId, eventType, details);
  } catch (error) {
    console.error('Failed to record audit log:', error);
    // Fallback if DB fails
    console.log('📊 [Audit Fallback]', JSON.stringify({ studentId, eventType, details }, null, 2));
  }
}

export default router;
