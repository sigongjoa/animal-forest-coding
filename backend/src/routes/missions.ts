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
