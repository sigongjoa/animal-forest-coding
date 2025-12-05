import { Router, Request, Response } from 'express';
import { sceneService } from '../../services/SceneService';
import { checkAdminAuth, AdminRequest } from '../../middleware/adminAuth';
import { CreateSceneRequest, ReorderScenesRequest } from '../../models/Scene';

const router = Router();

/**
 * GET /api/admin/episodes
 * Get all episodes
 */
router.get('/episodes', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const episodes = await sceneService.getAllEpisodes();

    res.json({
      success: true,
      data: episodes,
      count: episodes.length,
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch episodes',
    });
  }
});

/**
 * GET /api/admin/episodes/:episodeId
 * Get specific episode
 */
router.get('/episodes/:episodeId', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;
    const episode = await sceneService.getEpisode(episodeId);

    if (!episode) {
      return res.status(404).json({
        success: false,
        error: `Episode ${episodeId} not found`,
      });
    }

    res.json({
      success: true,
      data: episode,
    });
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch episode',
    });
  }
});

/**
 * POST /api/admin/episodes
 * Create new episode
 */
router.post('/episodes', checkAdminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { title, description, difficulty, order } = req.body;

    if (!title || !description || !difficulty || order === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, difficulty, order',
      });
    }

    const episode = await sceneService.createEpisode(title, description, difficulty, order);

    res.status(201).json({
      success: true,
      data: episode,
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create episode',
    });
  }
});

/**
 * PUT /api/admin/episodes/:episodeId
 * Update episode
 */
router.put('/episodes/:episodeId', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;
    const updates = req.body;

    const episode = await sceneService.updateEpisode(episodeId, updates);

    if (!episode) {
      return res.status(404).json({
        success: false,
        error: `Episode ${episodeId} not found`,
      });
    }

    res.json({
      success: true,
      data: episode,
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update episode',
    });
  }
});

/**
 * GET /api/admin/episodes/:episodeId/scenes
 * Get all scenes in episode
 */
router.get(
  '/episodes/:episodeId/scenes',
  checkAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const { episodeId } = req.params;
      const scenes = await sceneService.getEpisodeScenes(episodeId);

      res.json({
        success: true,
        data: scenes,
        count: scenes.length,
      });
    } catch (error) {
      console.error('Error fetching scenes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch scenes',
      });
    }
  }
);

/**
 * GET /api/admin/scenes/:sceneId
 * Get specific scene
 */
router.get('/scenes/:sceneId', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { sceneId } = req.params;
    const scene = await sceneService.getScene(sceneId);

    if (!scene) {
      return res.status(404).json({
        success: false,
        error: `Scene ${sceneId} not found`,
      });
    }

    res.json({
      success: true,
      data: scene,
    });
  } catch (error) {
    console.error('Error fetching scene:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scene',
    });
  }
});

/**
 * POST /api/admin/episodes/:episodeId/scenes
 * Create new scene in episode
 */
router.post(
  '/episodes/:episodeId/scenes',
  checkAdminAuth,
  async (req: AdminRequest, res: Response) => {
    try {
      const { episodeId } = req.params;
      const sceneRequest: CreateSceneRequest = req.body;
      const adminId = (req as AdminRequest).userId || 'unknown';

      // Validate required fields
      if (!sceneRequest.type || !sceneRequest.character || !sceneRequest.npcName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: type, character, npcName',
        });
      }

      // Validate type-specific fields
      if (sceneRequest.type === 'story' && !sceneRequest.imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Story scenes require imageUrl and dialogues',
        });
      }

      if (sceneRequest.type === 'ide' && !sceneRequest.missionId) {
        return res.status(400).json({
          success: false,
          error: 'IDE scenes require missionId',
        });
      }

      if (sceneRequest.type === 'choice' && !sceneRequest.question) {
        return res.status(400).json({
          success: false,
          error: 'Choice scenes require question and options',
        });
      }

      const scene = await sceneService.createScene(episodeId, sceneRequest, adminId);

      if (!scene) {
        return res.status(404).json({
          success: false,
          error: `Episode ${episodeId} not found`,
        });
      }

      res.status(201).json({
        success: true,
        data: scene,
      });
    } catch (error) {
      console.error('Error creating scene:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create scene',
      });
    }
  }
);

/**
 * PUT /api/admin/scenes/:sceneId
 * Update scene
 */
router.put('/scenes/:sceneId', checkAdminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { sceneId } = req.params;
    const sceneRequest: Partial<CreateSceneRequest> = req.body;
    const adminId = (req as AdminRequest).userId || 'unknown';

    const scene = await sceneService.updateScene(sceneId, sceneRequest, adminId);

    if (!scene) {
      return res.status(404).json({
        success: false,
        error: `Scene ${sceneId} not found`,
      });
    }

    res.json({
      success: true,
      data: scene,
    });
  } catch (error) {
    console.error('Error updating scene:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scene',
    });
  }
});

/**
 * DELETE /api/admin/scenes/:sceneId
 * Delete scene
 */
router.delete('/scenes/:sceneId', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const { sceneId } = req.params;
    const success = await sceneService.deleteScene(sceneId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Scene ${sceneId} not found`,
      });
    }

    res.json({
      success: true,
      message: `Scene ${sceneId} deleted`,
    });
  } catch (error) {
    console.error('Error deleting scene:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scene',
    });
  }
});

/**
 * PATCH /api/admin/episodes/:episodeId/scenes/reorder
 * Reorder scenes in episode
 */
router.patch(
  '/episodes/:episodeId/scenes/reorder',
  checkAdminAuth,
  async (req: Request, res: Response) => {
    try {
      const { episodeId } = req.params;
      const { sceneOrder }: ReorderScenesRequest = req.body;

      if (!Array.isArray(sceneOrder) || sceneOrder.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'sceneOrder must be a non-empty array of scene IDs',
        });
      }

      const episode = await sceneService.reorderScenes(episodeId, sceneOrder);

      if (!episode) {
        return res.status(404).json({
          success: false,
          error: `Episode ${episodeId} not found`,
        });
      }

      res.json({
        success: true,
        data: episode,
        message: 'Scenes reordered successfully',
      });
    } catch (error) {
      console.error('Error reordering scenes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder scenes',
      });
    }
  }
);

export default router;
