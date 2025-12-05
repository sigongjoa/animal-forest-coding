import { Router, Request, Response } from 'express';
import { missionService } from '../services/MissionService';

const router = Router();

/**
 * GET /api/missions
 * Get all missions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const missions = await missionService.getAllMissions();

    res.json({
      success: true,
      data: missions,
      count: missions.length,
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch missions',
    });
  }
});

/**
 * GET /api/missions/:missionId
 * Get a specific mission by ID
 */
router.get('/:missionId', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const mission = await missionService.getMission(missionId);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: `Mission ${missionId} not found`,
      });
    }

    res.json({
      success: true,
      data: mission,
    });
  } catch (error) {
    console.error('Error fetching mission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mission',
    });
  }
});

/**
 * GET /api/missions/difficulty/:difficulty
 * Get missions by difficulty level
 */
router.get('/difficulty/:difficulty', async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.params;

    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level',
      });
    }

    const missions = await missionService.getMissionsByDifficulty(
      difficulty as 'beginner' | 'intermediate' | 'advanced'
    );

    res.json({
      success: true,
      data: missions,
      count: missions.length,
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch missions',
    });
  }
});

/**
 * GET /api/missions/:missionId/prerequisites
 * Get prerequisites for a mission
 */
router.get('/:missionId/prerequisites', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const prerequisites = await missionService.getMissionPrerequisites(missionId);

    res.json({
      success: true,
      data: prerequisites,
      count: prerequisites.length,
    });
  } catch (error) {
    console.error('Error fetching prerequisites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prerequisites',
    });
  }
});

/**
 * POST /api/missions/check-access
 * Check if student can access a mission
 */
router.post('/check-access', async (req: Request, res: Response) => {
  try {
    const { studentId, missionId, completedMissions } = req.body;

    if (!studentId || !missionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    const canStart = await missionService.canStartMission(
      studentId,
      missionId,
      completedMissions || []
    );

    res.json({
      success: true,
      data: {
        missionId,
        canStart,
      },
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check access',
    });
  }
});

/**
 * GET /api/missions/:missionId/solution
 * Get solution for a mission (includes explanation, key points, common mistakes)
 */
router.get('/:missionId/solution', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const mission = await missionService.getMission(missionId);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: `Mission ${missionId} not found`,
      });
    }

    if (!mission.solution) {
      return res.status(404).json({
        success: false,
        error: `No solution available for mission ${missionId}`,
      });
    }

    res.json({
      success: true,
      data: {
        missionId,
        solution: mission.solution,
      },
    });
  } catch (error) {
    console.error('Error fetching mission solution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mission solution',
    });
  }
});

/**
 * POST /api/missions/:missionId/compare
 * Compare student code with solution
 * Returns: similarities, suggestions, test results
 */
router.post('/:missionId/compare', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const { studentCode } = req.body;

    if (!studentCode) {
      return res.status(400).json({
        success: false,
        error: 'Student code is required',
      });
    }

    const mission = await missionService.getMission(missionId);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: `Mission ${missionId} not found`,
      });
    }

    if (!mission.solution) {
      return res.status(404).json({
        success: false,
        error: `No solution available for mission ${missionId}`,
      });
    }

    // 간단한 유사도 계산 (코드 비교)
    const solutionCode = mission.solution.code;
    const similarity = calculateSimilarity(studentCode, solutionCode);

    // 기본 제안
    const suggestions: string[] = [];
    if (similarity < 0.5) {
      suggestions.push('코드 구조를 다시 확인해주세요');
    }
    if (!studentCode.includes('System.out.println') && solutionCode.includes('System.out.println')) {
      suggestions.push('출력문(System.out.println)을 추가해보세요');
    }
    if (!studentCode.includes(';') && solutionCode.includes(';')) {
      suggestions.push('세미콜론(;)을 빼먹지 마세요');
    }

    res.json({
      success: true,
      data: {
        missionId,
        studentCode,
        solutionCode,
        similarities: parseFloat(similarity.toFixed(2)),
        suggestions,
        keyPoints: mission.solution.keyPoints || [],
        commonMistakes: mission.solution.commonMistakes || [],
      },
    });
  } catch (error) {
    console.error('Error comparing codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare codes',
    });
  }
});

/**
 * Simple similarity calculation (Levenshtein distance based)
 */
function calculateSimilarity(code1: string, code2: string): number {
  const s1 = code1.trim().toLowerCase();
  const s2 = code2.trim().toLowerCase();

  if (s1 === s2) return 1.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = getLevenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function getLevenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

/**
 * GET /api/missions/stats/curriculum
 * Get curriculum statistics
 */
router.get('/stats/curriculum', async (req: Request, res: Response) => {
  try {
    const stats = await missionService.getCurriculumStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching curriculum stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch curriculum stats',
    });
  }
});

export default router;
