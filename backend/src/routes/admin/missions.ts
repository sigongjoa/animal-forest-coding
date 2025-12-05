import { Router, Request, Response } from 'express';
import { missionService } from '../../services/MissionService';
import { checkAdminAuth, AdminRequest } from '../../middleware/adminAuth';
import { Mission, MissionSolution } from '../../models/Mission';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

/**
 * GET /api/admin/missions
 * Get all missions
 */
router.get('/missions', checkAdminAuth, async (req: Request, res: Response) => {
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
 * GET /api/admin/missions/:missionId
 * Get specific mission
 */
router.get('/missions/:missionId', checkAdminAuth, async (req: Request, res: Response) => {
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
 * POST /api/admin/missions
 * Create new mission
 */
router.post('/missions', checkAdminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const mission: Mission = req.body;
    const adminId = (req as AdminRequest).userId || 'unknown';

    // Validate required fields
    if (!mission.id || !mission.title || !mission.difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, title, difficulty',
      });
    }

    const now = new Date().toISOString();
    const newMission: Mission = {
      ...mission,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    // Write mission file
    const cwd = process.cwd();
    const basePath = cwd.endsWith('backend')
      ? path.join(cwd, 'data', 'missions')
      : path.join(cwd, 'backend', 'data', 'missions');
    const filePath = path.join(basePath, `${mission.id}.json`);

    // Check if mission already exists
    try {
      await fs.stat(filePath);
      return res.status(409).json({
        success: false,
        error: `Mission ${mission.id} already exists`,
      });
    } catch {
      // File doesn't exist, we can create it
    }

    await fs.writeFile(filePath, JSON.stringify(newMission, null, 2));

    res.status(201).json({
      success: true,
      data: newMission,
    });
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create mission',
    });
  }
});

/**
 * PUT /api/admin/missions/:missionId
 * Update mission
 */
router.put('/missions/:missionId', checkAdminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { missionId } = req.params;
    const adminId = (req as AdminRequest).userId || 'unknown';

    const existingMission = await missionService.getMission(missionId);
    if (!existingMission) {
      return res.status(404).json({
        success: false,
        error: `Mission ${missionId} not found`,
      });
    }

    const updates = req.body;
    const updatedMission: Mission = {
      ...existingMission,
      ...updates,
      id: existingMission.id,
      createdAt: existingMission.createdAt,
      version: existingMission.version + 1,
      updatedAt: new Date().toISOString(),
    };

    // Write updated mission file
    const cwd = process.cwd();
    const basePath = cwd.endsWith('backend')
      ? path.join(cwd, 'data', 'missions')
      : path.join(cwd, 'backend', 'data', 'missions');
    const filePath = path.join(basePath, `${missionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedMission, null, 2));

    res.json({
      success: true,
      data: updatedMission,
    });
  } catch (error) {
    console.error('Error updating mission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mission',
    });
  }
});

/**
 * DELETE /api/admin/missions/:missionId
 * Delete mission
 */
router.delete('/missions/:missionId', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = await missionService.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: `Mission ${missionId} not found`,
      });
    }

    // Delete mission file
    const cwd = process.cwd();
    const basePath = cwd.endsWith('backend')
      ? path.join(cwd, 'data', 'missions')
      : path.join(cwd, 'backend', 'data', 'missions');
    const filePath = path.join(basePath, `${missionId}.json`);
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: `Mission ${missionId} deleted`,
    });
  } catch (error) {
    console.error('Error deleting mission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mission',
    });
  }
});

/**
 * PUT /api/admin/missions/:missionId/solution
 * Update mission solution
 */
router.put(
  '/missions/:missionId/solution',
  checkAdminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { missionId } = req.params;
      const adminId = (req as AdminRequest).userId || 'unknown';
      const solution: MissionSolution = req.body;

      const mission = await missionService.getMission(missionId);
      if (!mission) {
        return res.status(404).json({
          success: false,
          error: `Mission ${missionId} not found`,
        });
      }

      // Validate solution fields
      if (!solution.code || !solution.explanation || !solution.keyPoints) {
        return res.status(400).json({
          success: false,
          error: 'Missing required solution fields: code, explanation, keyPoints',
        });
      }

      const updatedMission: Mission = {
        ...mission,
        solution,
        version: mission.version + 1,
        updatedAt: new Date().toISOString(),
      };

      // Write updated mission file
      const cwd = process.cwd();
      const basePath = cwd.endsWith('backend')
        ? path.join(cwd, 'data', 'missions')
        : path.join(cwd, 'backend', 'data', 'missions');
      const filePath = path.join(basePath, `${missionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(updatedMission, null, 2));

      res.json({
        success: true,
        data: {
          missionId,
          solution: updatedMission.solution,
        },
      });
    } catch (error) {
      console.error('Error updating mission solution:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update mission solution',
      });
    }
  }
);

/**
 * GET /api/admin/missions/by-difficulty/:difficulty
 * Get missions by difficulty level
 */
router.get(
  '/missions/by-difficulty/:difficulty',
  checkAdminAuth,
  async (req: Request, res: Response) => {
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
  }
);

export default router;
