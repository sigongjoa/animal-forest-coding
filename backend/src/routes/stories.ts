import { Router, Request, Response } from 'express';
import { storyService } from '../services/StoryService';

const router = Router();

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * GET /api/stories/:episodeId
 *
 * Fetch single episode by ID
 * Returns all scenes, dialogues, and reward configuration
 *
 * Example:
 *   GET /api/stories/ep_1
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Episode loaded successfully",
 *     "data": {
 *       "id": "ep_1",
 *       "title": "파이썬과의 첫 만남",
 *       "scenes": [...],
 *       "rewards": {...}
 *     }
 *   }
 *
 * Response (404):
 *   {
 *     "success": false,
 *     "message": "Episode not found",
 *     "error": "Episode ep_1 does not exist"
 *   }
 */
router.get('/:episodeId', async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;

    // Validate episodeId format
    if (!episodeId || !/^[a-z0-9_-]+$/.test(episodeId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid episode ID format',
        error: 'Episode ID must contain only lowercase letters, numbers, underscores, and hyphens'
      } as ApiResponse<null>);
      return;
    }

    // Load episode
    const episode = await storyService.getEpisode(episodeId);

    if (!episode) {
      res.status(404).json({
        success: false,
        message: 'Episode not found',
        error: `Episode ${episodeId} does not exist. Check backend/data/stories/ directory.`
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
 *
 * Fetch all episodes
 * Returns array sorted by order field
 *
 * Example:
 *   GET /api/stories
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Episodes loaded successfully",
 *     "data": [
 *       {
 *         "id": "ep_1",
 *         "title": "파이썬과의 첫 만남",
 *         "order": 1,
 *         ...
 *       },
 *       {
 *         "id": "ep_2",
 *         "title": "변수와 자료형",
 *         "order": 2,
 *         ...
 *       }
 *     ]
 *   }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const episodes = await storyService.getAllEpisodes();

    res.json({
      success: true,
      message: `${episodes.length} episodes loaded successfully`,
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

/**
 * GET /api/stories/cache/stats
 *
 * Internal endpoint for cache statistics
 * Useful for monitoring and debugging
 *
 * Example:
 *   GET /api/stories/cache/stats
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "size": 2,
 *       "episodes": ["ep_1", "ep_2"],
 *       "maxSize": 20
 *     }
 *   }
 */
router.get('/cache/stats', (req: Request, res: Response) => {
  try {
    const stats = storyService.getCacheStats();

    res.json({
      success: true,
      message: 'Cache statistics',
      data: {
        ...stats,
        maxSize: 20
      }
    } as ApiResponse<any>);
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse<null>);
  }
});

export default router;
