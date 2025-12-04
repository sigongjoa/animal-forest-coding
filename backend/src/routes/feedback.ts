/**
 * Feedback API Routes
 *
 * Endpoints:
 * - POST /api/feedback - 코드 분석 및 피드백 생성
 * - GET /api/feedback/stats - 피드백 캐시 통계
 * - POST /api/feedback/clear - 캐시 정리
 *
 * Phase 3.1 구현
 */

import { Router, Request, Response } from 'express';
import { NookAIService, CodeSubmission } from '../services/NookAIService';
import { FeedbackCache } from '../services/FeedbackCache';

const router = Router();
const nookAI = new NookAIService();
const feedbackCache = new FeedbackCache(1000);

/**
 * Rate Limiting을 위한 간단한 구현
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return false;
  }

  return true;
}

/**
 * POST /api/feedback
 * 코드 분석 및 피드백 생성
 */
router.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const { studentId, missionId, code, language } = req.body;

    // 입력 검증
    if (!studentId || !missionId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studentId, missionId, code',
      });
    }

    if (!['python', 'javascript', 'typescript'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Supported: python, javascript, typescript',
      });
    }

    // Rate Limiting 확인
    const clientId = `${studentId}:${missionId}`;
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      });
    }

    // 캐시 확인
    const cachedFeedback = feedbackCache.get(studentId, missionId, code);
    if (cachedFeedback) {
      return res.status(200).json({
        success: true,
        data: {
          ...cachedFeedback,
          fromCache: true,
        },
      });
    }

    // AI 피드백 생성 (타이머 시작)
    const startTime = Date.now();

    const submission: CodeSubmission = {
      studentId,
      missionId,
      code,
      language: language as any,
      submittedAt: new Date(),
    };

    const feedback = await nookAI.generateFeedback(submission);

    // 응답 시간 기록
    const responseTime = Date.now() - startTime;
    feedbackCache.recordResponseTime(responseTime);

    // 캐시에 저장
    feedbackCache.set(feedback);

    return res.status(200).json({
      success: true,
      data: {
        ...feedback,
        fromCache: false,
        responseTime,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/feedback:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/feedback/stats
 * 피드백 캐시 통계 조회
 */
router.get('/api/feedback/stats', (req: Request, res: Response) => {
  try {
    const stats = feedbackCache.getStats();
    const efficiency = feedbackCache.getEfficiencyReport();

    return res.status(200).json({
      success: true,
      data: {
        cache: stats,
        efficiency,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/feedback/stats:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/feedback/clear
 * 캐시 정리
 */
router.post('/api/feedback/clear', (req: Request, res: Response) => {
  try {
    const { studentId, missionId, type = 'all' } = req.body;

    if (type === 'student' && studentId) {
      feedbackCache.clearByStudent(studentId);
    } else if (type === 'mission' && missionId) {
      feedbackCache.clearByMission(missionId);
    } else {
      feedbackCache.clear();
    }

    return res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/feedback/clear:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/feedback/health
 * 피드백 서비스 상태 확인
 */
router.get('/api/feedback/health', (req: Request, res: Response) => {
  try {
    const stats = feedbackCache.getStats();

    return res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        cacheSize: stats.cachedFeedbacks,
        totalRequests: stats.totalRequests,
        hitRate: (stats.hitRate * 100).toFixed(2) + '%',
        avgResponseTime: stats.averageResponseTime.toFixed(2) + 'ms',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/feedback/health:', error);

    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/feedback/cleanup
 * 오래된 캐시 정리
 */
router.post('/api/feedback/cleanup', (req: Request, res: Response) => {
  try {
    feedbackCache.cleanup();

    const stats = feedbackCache.getStats();

    return res.status(200).json({
      success: true,
      message: 'Cache cleanup completed',
      data: {
        remainingCached: stats.cachedFeedbacks,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/feedback/cleanup:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
